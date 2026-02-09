import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Imap from "imap";
import { simpleParser } from "mailparser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface EmailMessage {
  id: number;
  uid: number;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  date: string;
  snippet: string;
  body: string;
  isRead: boolean;
  hasAttachments: boolean;
  folder: string;
}

const FOLDER_CANDIDATES: Record<string, string[]> = {
  Spam: ["Spam", "INBOX.Spam", "Junk", "INBOX.Junk", "INBOX.spam"],
  Sent: ["Sent", "INBOX.Sent", "Sent Messages", "INBOX.Sent Messages"],
  Drafts: ["Drafts", "INBOX.Drafts", "Draft", "INBOX.Draft"],
  Trash: ["Trash", "INBOX.Trash", "Deleted", "INBOX.Deleted"],
};

function getFolderCandidates(folder: string): string[] {
  if (FOLDER_CANDIDATES[folder]) return FOLDER_CANDIDATES[folder];
  if (folder === "INBOX") return ["INBOX"];
  if (folder.startsWith("INBOX.")) return [folder];
  return [folder, `INBOX.${folder}`];
}

function isFolderError(errMsg: string): boolean {
  const lower = errMsg.toLowerCase();
  return (
    lower.includes("nonexistent") ||
    lower.includes("namespace") ||
    lower.includes("exist") ||
    lower.includes("mailbox") ||
    lower.includes("no such")
  );
}

function createImapConnection(config: { user: string; password: string; host: string; port: number }, opts?: { connTimeout?: number; authTimeout?: number }) {
  return new Imap({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    connTimeout: opts?.connTimeout ?? 15000,
    authTimeout: opts?.authTimeout ?? 10000,
  });
}

// Fetch email list - HEADERS ONLY (fast)
async function fetchEmails(
  config: { user: string; password: string; host: string; port: number },
  folder: string = "INBOX",
  limit: number = 10
): Promise<EmailMessage[]> {
  return new Promise((resolve, reject) => {
    const imap = createImapConnection(config);
    const timeout = setTimeout(() => {
      try { imap.end(); } catch (e) {}
      reject(new Error("Connection timeout"));
    }, 30000);

    const emails: EmailMessage[] = [];
    let isFinished = false;

    const finish = (result: EmailMessage[] | Error) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeout);
      try { imap.end(); } catch (e) {}
      if (result instanceof Error) reject(result);
      else resolve(result);
    };

    imap.once("ready", () => {
      const candidates = getFolderCandidates(folder);

      const tryOpen = (remaining: string[]) => {
        if (remaining.length === 0) {
          finish([]);
          return;
        }
        const current = remaining[0];
          imap.openBox(current, true, (err, box) => {
            if (err) {
              if (isFolderError(err.message)) {
                tryOpen(remaining.slice(1));
                return;
              }
              finish(err);
              return;
            }

            const total = box.messages.total;

            if (total === 0) {
              finish([]);
              return;
            }

            const start = Math.max(1, total - limit + 1);
            const fetchRange = `${start}:${total}`;
            // Fetch ONLY headers - much faster than full body
            const f = imap.seq.fetch(fetchRange, {
              bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE CONTENT-TYPE)"],
              struct: false,
            });

            let msgCount = 0;

            f.on("message", (msg, seqno) => {
              let uid = 0;
              const flags: string[] = [];
              let headerData = "";

              msg.on("attributes", (attrs) => {
                uid = attrs.uid;
                flags.push(...(attrs.flags || []));
              });

              msg.on("body", (stream) => {
                stream.on("data", (chunk: Buffer) => {
                  headerData += chunk.toString("utf8");
                });
              });

              msg.once("end", () => {
                msgCount++;
                try {
                  const headers = Imap.parseHeader(headerData);
                  const fromRaw = (headers.from || [""])[0];
                  const match = fromRaw.match(/^"?([^"<]*)"?\s*<?([^>]*)>?$/);
                  const fromName = match?.[1]?.trim() || fromRaw;
                  const fromEmail = match?.[2]?.trim() || fromRaw;
                  const hasAttachments = (headers["content-type"] || []).some(
                    (ct: string) => ct.toLowerCase().includes("multipart/mixed")
                  );

                  emails.push({
                    id: seqno,
                    uid,
                    subject: (headers.subject || ["(بدون موضوع)"])[0],
                    from: fromName,
                    fromEmail,
                    to: (headers.to || [""])[0],
                    date: headers.date?.[0]
                      ? new Date(headers.date[0]).toISOString()
                      : new Date().toISOString(),
                    snippet: "",
                    body: "",
                    isRead: flags.includes("\\Seen"),
                    hasAttachments,
                    folder: current,
                  });
                } catch (e) {
                  // skip unparseable message
                }
              });
            });

            f.once("error", (err) => finish(err));
            f.once("end", () => {
              emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              finish(emails);
            });
        });
      };

      tryOpen(candidates);
    });

    imap.on("error", (err: Error) => finish(err));
    imap.once("end", () => {
      if (!isFinished) {
        emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        finish(emails);
      }
    });

    imap.connect();
  });
}

// Fetch single email body by UID
async function fetchEmailBody(
  config: { user: string; password: string; host: string; port: number },
  folder: string,
  uid: number
): Promise<{ body: string; snippet: string }> {
  return new Promise((resolve, reject) => {
    const imap = createImapConnection(config);
    const timeout = setTimeout(() => {
      try { imap.end(); } catch (e) {}
      reject(new Error("Connection timeout"));
    }, 30000);

    let isFinished = false;
    const finish = (result: { body: string; snippet: string } | Error) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeout);
      try { imap.end(); } catch (e) {}
      if (result instanceof Error) reject(result);
      else resolve(result);
    };

    imap.once("ready", () => {
      const candidates = getFolderCandidates(folder);

      const tryOpen = (remaining: string[]) => {
        if (remaining.length === 0) {
          finish({ body: "", snippet: "" });
          return;
        }
        const current = remaining[0];
        imap.openBox(current, true, (err) => {
          if (err) {
            if (isFolderError(err.message)) {
              tryOpen(remaining.slice(1));
              return;
            }
            finish(err);
            return;
          }

          const f = imap.fetch([uid], { bodies: "", struct: true });
          let fullBody = "";

          f.on("message", (msg) => {
            msg.on("body", (stream) => {
              stream.on("data", (chunk: Buffer) => {
                fullBody += chunk.toString("utf8");
              });
            });
          });

          f.once("error", (err) => finish(err));
          f.once("end", async () => {
            try {
              const parsed = await simpleParser(fullBody);
              finish({
                body: parsed.html || parsed.text || "",
                snippet: (parsed.text || "").substring(0, 200),
              });
            } catch (e) {
              finish({ body: fullBody, snippet: fullBody.substring(0, 200) });
            }
            try { imap.end(); } catch (e) {}
          });
        });
      };

      tryOpen(candidates);
    });

    imap.on("error", (err: Error) => finish(err));
    imap.once("end", () => {
      if (!isFinished) finish({ body: "", snippet: "" });
    });

    imap.connect();
  });
}

// Mark email as read by UID
async function markAsRead(
  config: { user: string; password: string; host: string; port: number },
  folder: string,
  uid: number
): Promise<boolean> {
  return new Promise((resolve) => {
    const imap = createImapConnection(config, { connTimeout: 10000, authTimeout: 5000 });
    let isFinished = false;
    const timeout = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        try { imap.end(); } catch (e) {}
        resolve(false);
      }
    }, 15000);

    const finish = (success: boolean) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeout);
      try { imap.end(); } catch (e) {}
      resolve(success);
    };

    imap.once("ready", () => {
      const candidates = getFolderCandidates(folder);

      const tryOpen = (remaining: string[]) => {
        if (remaining.length === 0) {
          finish(false);
          return;
        }
        // Open box as read-write (false = not read-only)
        imap.openBox(remaining[0], false, (err) => {
          if (err) {
            if (isFolderError(err.message)) {
              tryOpen(remaining.slice(1));
              return;
            }
            finish(false);
            return;
          }
          imap.addFlags([uid], ["\\Seen"], (flagErr) => {
            finish(!flagErr);
          });
        });
      };

      tryOpen(candidates);
    });

    imap.on("error", () => finish(false));
    imap.connect();
  });
}

async function getUnreadCount(
  config: { user: string; password: string; host: string; port: number },
  folder: string = "INBOX"
): Promise<number> {
  return new Promise((resolve) => {
    const imap = createImapConnection(config, { connTimeout: 10000, authTimeout: 5000 });
    let isFinished = false;
    const timeout = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        try { imap.end(); } catch (e) {}
        resolve(0);
      }
    }, 15000);

    const finish = (count: number) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeout);
      try { imap.end(); } catch (e) {}
      resolve(count);
    };

    imap.once("ready", () => {
      const candidates = getFolderCandidates(folder);

      const tryOpen = (remaining: string[]) => {
        if (remaining.length === 0) {
          finish(0);
          return;
        }
        imap.openBox(remaining[0], true, (err, box) => {
          if (err) {
            if (isFolderError(err.message)) {
              tryOpen(remaining.slice(1));
              return;
            }
            finish(0);
            return;
          }
          imap.search(["UNSEEN"], (searchErr, results) => {
            finish(searchErr ? 0 : results.length);
          });
        });
      };

      tryOpen(candidates);
    });

    imap.on("error", () => finish(0));
    imap.connect();
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const companyId = searchParams.get("company_id");
    const folder = searchParams.get("folder") || "INBOX";
    const action = searchParams.get("action") || "fetch";
    const limit = parseInt(searchParams.get("limit") || "20");
    const uid = searchParams.get("uid");

    if (!accountId) {
      return NextResponse.json({ error: "معرف الحساب مطلوب" }, { status: 400 });
    }

    let query = supabase
      .from("company_email_accounts")
      .select("*")
      .eq("id", accountId);

    if (companyId) {
      query = query.eq("company_id", parseInt(companyId));
    }

    const { data: account, error: accountError } = await query.single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: "حساب البريد غير موجود" },
        { status: 404 }
      );
    }

    const config = {
      user: account.email,
      password: account.password,
      host: account.imap_host,
      port: account.imap_port,
    };

      // Mark email as read
      if (action === "markread" && uid) {
        const success = await markAsRead(config, folder, parseInt(uid));
        return NextResponse.json({ success });
      }

      // Get unread count
      if (action === "unread") {
      const unreadCount = await getUnreadCount(config, folder);
      return NextResponse.json({ unreadCount });
    }

    // Get single email body by UID
    if (action === "body" && uid) {
      const result = await fetchEmailBody(config, folder, parseInt(uid));
      return NextResponse.json(result);
    }

    // Get email list (headers only - fast)
    const emails = await fetchEmails(config, folder, limit);

    await supabase
      .from("company_email_accounts")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", accountId);

    return NextResponse.json({ emails, folder });
  } catch (error) {
    console.error("Error fetching emails:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ";
    const isAuthError =
      errorMessage.toLowerCase().includes("authentication failed") ||
      errorMessage.toLowerCase().includes("invalid credentials") ||
      errorMessage.includes("AUTHENTICATIONFAILED") ||
      (error as any).textCode === "AUTHENTICATIONFAILED";

    if (isAuthError) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.", requiresAuth: true },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `حدث خطأ في جلب الرسائل: ${errorMessage}` },
      { status: 500 }
    );
  }
}

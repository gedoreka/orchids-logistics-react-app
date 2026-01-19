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

async function fetchEmails(
  config: {
    user: string;
    password: string;
    host: string;
    port: number;
  },
  folder: string = "INBOX",
  limit: number = 10
): Promise<EmailMessage[]> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Connection timeout"));
    }, 15000);

    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 8000,
      authTimeout: 5000,
    });

    const emails: EmailMessage[] = [];
    const parsePromises: Promise<void>[] = [];

    imap.once("ready", () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          imap.end();
          reject(err);
          return;
        }

        const totalMessages = box.messages.total;
        if (totalMessages === 0) {
          imap.end();
          resolve([]);
          return;
        }

        const start = Math.max(1, totalMessages - limit + 1);
        const fetchRange = `${start}:${totalMessages}`;

        const f = imap.seq.fetch(fetchRange, {
          bodies: "",
          struct: true,
        });

        f.on("message", (msg, seqno) => {
          let uid = 0;
          const flags: string[] = [];

          msg.on("attributes", (attrs) => {
            uid = attrs.uid;
            flags.push(...(attrs.flags || []));
          });

          msg.on("body", (stream) => {
            let buffer = "";
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8");
            });

            const parsePromise = new Promise<void>((resolveParse) => {
              stream.once("end", async () => {
                try {
                  const parsed = await simpleParser(buffer);
                  const fromAddr = parsed.from?.value?.[0];
                  emails.push({
                    id: seqno,
                    uid,
                    subject: parsed.subject || "(بدون موضوع)",
                    from: fromAddr?.name || fromAddr?.address || "غير معروف",
                    fromEmail: fromAddr?.address || "",
                    to: parsed.to?.text || "",
                    date: parsed.date?.toISOString() || new Date().toISOString(),
                    snippet: (parsed.text || "").substring(0, 200),
                    body: parsed.html || parsed.text || "",
                    isRead: flags.includes("\\Seen"),
                    hasAttachments: (parsed.attachments?.length || 0) > 0,
                    folder,
                  });
                } catch (parseErr) {
                  console.error("Error parsing email:", parseErr);
                } finally {
                  resolveParse();
                }
              });
            });
            parsePromises.push(parsePromise);
          });
        });

        f.once("error", (fetchErr) => {
          imap.end();
          reject(fetchErr);
        });

        f.once("end", () => {
          imap.end();
        });
      });
    });

    imap.once("error", (err: Error) => {
      reject(err);
    });

    imap.once("end", async () => {
      clearTimeout(timeout);
      await Promise.all(parsePromises);
      emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(emails);
    });

    imap.connect();
  });
}

async function getUnreadCount(
  config: {
    user: string;
    password: string;
    host: string;
    port: number;
  },
  folder: string = "INBOX"
): Promise<number> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve(0);
    }, 8000);

    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 5000,
      authTimeout: 3000,
    });

    imap.once("ready", () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          imap.end();
          reject(err);
          return;
        }
      imap.search(["UNSEEN"], (searchErr, results) => {
            clearTimeout(timeout);
            imap.end();
            if (searchErr) {
              reject(searchErr);
              return;
            }
            resolve(results.length);
          });
      });
    });

    imap.once("error", (err: Error) => {
      reject(err);
    });

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

    if (action === "unread") {
      const unreadCount = await getUnreadCount(config, folder);
      return NextResponse.json({ unreadCount });
    }

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

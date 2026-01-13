import { forgotPasswordAction } from "./src/lib/actions/auth";

async function test() {
  const formData = new FormData();
  formData.append("email", "admin@zoolspeed.com");
  
  console.log("Testing forgotPasswordAction for admin@zoolspeed.com...");
  const result = await forgotPasswordAction(formData);
  console.log("Result:", result);
}

test();

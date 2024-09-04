export default async function verifyCaptcha(response: any) {
  let url, res, data;
  if (typeof response !== "string") {
    return false;
  }
  url = new URL("https://www.google.com/recaptcha/api/siteverify");
  url.searchParams.set("secret", process.env.RECAPTCHA_SECRET_KEY);
  url.searchParams.set("response", response);
  res = await fetch(url, { method: "POST" });
  data = (await res.json()) as { success: boolean };
  if (data.success) {
    return true;
  }
  return false;
}

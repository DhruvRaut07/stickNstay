import { describe, expect, it } from "vitest";
import { esc, firstName, loginCodeEmail, orderConfirmationEmail, welcomeEmail } from "./email-templates";

const site = "https://shop.example";
const order = {
  code: "SNS-ABCD1234",
  name: "DHRUV RAUT",
  variant: "basic" as const,
  qty: 3,
  total: 120,
  items: [
    { name: "Snacks First", qty: 2 },
    { name: "Dream Big", qty: 1 },
  ],
};

describe("firstName and esc", () => {
  it("title-cases the first word of a roster name", () => {
    expect(firstName("DHRUV RAUT")).toBe("Dhruv");
    expect(firstName("  ranvijay singh ")).toBe("Ranvijay");
  });

  it("falls back to a friendly word for an empty name", () => {
    expect(firstName("")).toBe("there");
  });

  it("escapes HTML special characters", () => {
    expect(esc(`<b>"A" & 'B'</b>`)).toBe("&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;");
  });
});

describe("orderConfirmationEmail", () => {
  const mail = orderConfirmationEmail(order, site);

  it("has a clear subject with the order code", () => {
    expect(mail.subject).toBe("You're in! Order SNS-ABCD1234 is confirmed");
  });

  it("shows the code, items and total in the html", () => {
    expect(mail.html).toContain("SNS-ABCD1234");
    expect(mail.html).toContain("Snacks First");
    expect(mail.html).toContain("× 2");
    expect(mail.html).toContain("₹120");
    expect(mail.html).toContain("You're in, Dhruv!");
  });

  it("uses absolute links and images on the site address", () => {
    expect(mail.html).toContain(`${site}/shop`);
    expect(mail.html).toContain(`${site}/email/logo-on-yellow.png`);
  });

  it("has a plain-text version with the essentials and no markup", () => {
    expect(mail.text).toContain("SNS-ABCD1234");
    expect(mail.text).toContain("2 x Snacks First");
    expect(mail.text).toContain("Rs 120");
    expect(mail.text).not.toMatch(/<[a-z]/i);
  });

  it("never lets a customer's text become markup", () => {
    const evil = orderConfirmationEmail({ ...order, name: "<script>x</script>", note: '"><img src=x>', items: [{ name: "<i>hi</i>", qty: 1 }] }, site);
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).not.toContain("<img src=x>");
    expect(evil.html).not.toContain("<i>hi</i>");
    expect(evil.html).toContain("&lt;i&gt;hi&lt;/i&gt;");
  });

  it("describes a custom photo order without an items list", () => {
    const custom = orderConfirmationEmail({ code: "SNS-1", name: "A B", variant: "custom", qty: 2, total: 100 }, site);
    expect(custom.html).toContain("Custom photo magnet");
    expect(custom.html).toContain("print your photo exactly as you sent it");
  });
});

describe("loginCodeEmail", () => {
  const mail = loginCodeEmail("482913", site);

  it("puts the code in the subject, body and text", () => {
    expect(mail.subject).toBe("482913 is your stickNstay login code");
    expect(mail.html).toContain("482913");
    expect(mail.text).toContain("482913");
  });

  it("mentions the 10 minute expiry", () => {
    expect(mail.text).toContain("10 minutes");
  });
});

describe("welcomeEmail", () => {
  const mail = welcomeEmail("RANVIJAY SINGH", { basic: 40, custom: 50 }, site);

  it("greets by first name and shows the live prices", () => {
    expect(mail.subject).toBe("Welcome to stickNstay, Ranvijay!");
    expect(mail.html).toContain("Hey Ranvijay, you're in!");
    expect(mail.html).toContain("₹40");
    expect(mail.html).toContain("₹50");
    expect(mail.text).toContain("Rs 40");
  });

  it("links to the shop and the custom order page", () => {
    expect(mail.html).toContain(`${site}/shop`);
    expect(mail.html).toContain(`${site}/order?variant=custom`);
  });
});

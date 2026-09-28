/**
 * TeamSetu seed script — creates a real mid-size demo business.
 *
 * PREREQUISITE: run supabase/schema.sql once in the Supabase SQL editor.
 *
 * Creates (via the service_role key, bypassing RLS):
 *  - Company: NexaFlow Technologies Pvt. Ltd. (100 employees + 1 new hire)
 *  - 101 employees across 8 departments
 *  - 3 login users (admin, employee, new hire) with confirmed emails
 *  - Leave requests (pending + approved + history)
 *  - Onboarding tasks for 2 new joiners
 *  - 1 DRAFT offer letter for the new hire (Aarav Kapoor)
 *
 * Env vars (never commit these):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   SEED_ADMIN_PASSWORD, SEED_EMP_PASSWORD, SEED_HIRE_PASSWORD
 *
 * Run: node scripts/seed.mjs
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const PASS = {
  admin: process.env.SEED_ADMIN_PASSWORD,
  emp: process.env.SEED_EMP_PASSWORD,
  hire: process.env.SEED_HIRE_PASSWORD,
};
if (!PASS.admin || !PASS.emp || !PASS.hire) {
  console.error("Missing env: SEED_ADMIN_PASSWORD, SEED_EMP_PASSWORD, SEED_HIRE_PASSWORD");
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

/* ---------- tiny seeded PRNG (stable data every run) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260928);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const iso = (d) => d.toISOString().slice(0, 10);

/* ---------- names & departments ---------- */
const FIRST_M = ["Aarav","Vihaan","Arjun","Rohan","Kabir","Aditya","Ishaan","Krishna","Vivaan","Aryan","Sai","Arnav","Rudra","Dhruv","Yash","Farhan","Imran","Zaid","Nikhil","Sahil","Manav","Dev","Ayaan","Rehan","Kunal","Varun","Siddharth","Pranav","Rahul","Amit"];
const FIRST_F = ["Diya","Sneha","Ananya","Priya","Ishita","Myra","Aadhya","Navya","Sara","Ira","Meera","Kavya","Riya","Anika","Shreya","Pooja","Nisha","Divya","Kiran","Lakshmi","Anjali","Ritu","Simran","Tanvi","Neha"];
const LAST = ["Sharma","Patel","Mehta","Iyer","Singh","Das","Malhotra","Nair","Kapoor","Bose","Reddy","Gupta","Khan","Verma","Joshi","Mishra","Agarwal","Kulkarni","Desai","Chopra","Pillai","Menon","Rao","Bhatt","Trivedi","Saxena","Chauhan","Yadav","Pandey","Kaur","Gill","Anand","Chandra","Dutta","Ghosh","Banerjee","Mukherjee","Sinha","Tiwari"];

const DEPTS = [
  ["Engineering", 34, ["Backend Developer","Frontend Developer","DevOps Engineer","QA Engineer","Data Engineer","Mobile Developer","Engineering Manager","Tech Lead"]],
  ["Design", 8, ["Product Designer","UX Researcher","Design Lead","Visual Designer"]],
  ["Sales", 14, ["Account Executive","Sales Development Rep","Sales Manager","Customer Success Manager"]],
  ["Marketing", 9, ["Content Strategist","SEO Specialist","Marketing Manager","Growth Lead","Social Media Executive"]],
  ["People", 6, ["HR Business Partner","Recruiter","HR Manager","Payroll Specialist"]],
  ["Finance", 6, ["Accountant","Financial Analyst","Finance Manager"]],
  ["Support", 12, ["Support Specialist","Support Lead","Technical Support Engineer"]],
  ["Operations", 11, ["Operations Executive","Office Manager","Operations Lead","Vendor Manager"]],
];
const LOCATIONS = ["Bangalore","Mumbai","Delhi","Hyderabad","Chennai","Pune","Gurgaon","Kolkata","Kochi","Ahmedabad"];
const DOMAIN = "nexaflowtech.in";

const ONBOARDING_TASKS = [
  "Send welcome email with day-one plan",
  "Collect ID proof and address proof",
  "Issue laptop and access card",
  "Create email and tool accounts",
  "Assign onboarding buddy",
  "Schedule HR orientation",
  "Complete payroll and bank details",
  "Day-7 check-in with manager",
];

async function main() {
  console.log("→ Clearing any previous NexaFlow seed…");
  const { data: { users } } = await admin.auth.admin.listUsers();
  for (const u of users || []) {
    if (u.email && u.email.endsWith("@" + DOMAIN)) {
      await admin.auth.admin.deleteUser(u.id);
    }
  }
  const { data: old } = await admin.from("companies").select("id").eq("slug", "nexaflow");
  for (const c of old || []) await admin.from("companies").delete().eq("id", c.id);

  console.log("→ Creating company…");
  const { data: company, error: coErr } = await admin.from("companies")
    .insert({ name: "NexaFlow Technologies Pvt. Ltd.", slug: "nexaflow", plan: "growth" })
    .select("id").single();
  if (coErr) throw coErr;
  const companyId = company.id;

  console.log("→ Generating employees…");
  const usedEmails = new Set();
  const emailFor = (first, last) => {
    let base = `${first}.${last}`.toLowerCase(), e = `${base}@${DOMAIN}`, i = 2;
    while (usedEmails.has(e)) { e = `${base}${i}@${DOMAIN}`; i++; }
    usedEmails.add(e);
    return e;
  };
  const employees = [
    { name: "Priya Nair", email: emailFor("Priya", "Nair"), phone: "+91 98200 11223",
      department: "People", title: "HR Manager", location: "Bangalore",
      joining_date: "2021-04-12", status: "active" },
    { name: "Rohan Mehta", email: emailFor("Rohan", "Mehta"), phone: "+91 98310 44556",
      department: "Engineering", title: "Engineering Manager", location: "Bangalore",
      joining_date: "2020-08-03", status: "active" },
  ];
  for (const [dept, count, roles] of DEPTS) {
    let made = (dept === "Engineering" || dept === "People") ? 1 : 0;
    while (made < count) {
      const female = rnd() < 0.42;
      const first = pick(female ? FIRST_F : FIRST_M);
      const last = pick(LAST);
      const join = new Date(Date.now() - Math.floor(rnd() * 3 * 365 + rnd() * 300) * 86400000);
      employees.push({
        name: `${first} ${last}`,
        email: emailFor(first, last),
        phone: `+91 ${Math.floor(6000000000 + rnd() * 3999999999)}`,
        department: dept,
        title: pick(roles),
        location: pick(LOCATIONS),
        joining_date: iso(join),
        status: "active",
      });
      made++;
    }
  }
  // A few recent joiners still onboarding
  const obIdx = new Set();
  while (obIdx.size < 4) obIdx.add(2 + Math.floor(rnd() * (employees.length - 2)));
  for (const i of obIdx) {
    employees[i].status = "onboarding";
    employees[i].joining_date = iso(new Date(Date.now() + Math.floor(rnd() * 20 - 10) * 86400000));
  }
  // The new hire you will onboard
  const aaravEmail = emailFor("Aarav", "Kapoor");
  employees.push({
    name: "Aarav Kapoor", email: aaravEmail, phone: "+91 98110 45678",
    department: "Engineering", title: "Backend Developer", location: "Bangalore",
    joining_date: iso(new Date(Date.now() + 14 * 86400000)), status: "offered",
  });

  const { data: inserted, error: eErr } = await admin.from("employees")
    .insert(employees.map((e) => ({ ...e, company_id: companyId })))
    .select("id, email, name, status");
  if (eErr) throw eErr;
  console.log(`  ${inserted.length} employees inserted`);
  const byEmail = Object.fromEntries(inserted.map((r) => [r.email, r]));
  const ids = inserted.map((r) => r.id);

  console.log("→ Creating leave requests…");
  const now = Date.now(), D = 86400000;
  const t = (ms) => iso(new Date(ms));
  const { error: lErr } = await admin.from("leave_requests").insert([
    { company_id: companyId, employee_id: ids[5], leave_type: "Annual leave", from_date: t(now + 9 * D), to_date: t(now + 12 * D), reason: "Family trip", status: "pending" },
    { company_id: companyId, employee_id: ids[12], leave_type: "Sick leave", from_date: t(now + D), to_date: t(now + D), reason: "Fever", status: "pending" },
    { company_id: companyId, employee_id: ids[20], leave_type: "Work from home", from_date: t(now + 3 * D), to_date: t(now + 4 * D), status: "pending" },
    { company_id: companyId, employee_id: ids[8], leave_type: "Annual leave", from_date: t(now - D), to_date: t(now + 2 * D), reason: "Vacation", status: "approved" },
    { company_id: companyId, employee_id: ids[30], leave_type: "Sick leave", from_date: t(now), to_date: t(now + D), status: "approved" },
    { company_id: companyId, employee_id: ids[15], leave_type: "Annual leave", from_date: t(now - 40 * D), to_date: t(now - 36 * D), reason: "Diwali break", status: "approved" },
    { company_id: companyId, employee_id: ids[22], leave_type: "Casual leave", from_date: t(now - 12 * D), to_date: t(now - 12 * D), reason: "Personal work", status: "declined" },
  ]);
  if (lErr) throw lErr;

  console.log("→ Creating onboarding tasks…");
  const ob = inserted.filter((r) => r.status === "onboarding").slice(0, 2);
  for (const o of ob) {
    const { error: tErr } = await admin.from("onboarding_tasks").insert(
      ONBOARDING_TASKS.map((title, i) => ({
        company_id: companyId, employee_id: o.id, title,
        done: rnd() < 0.45, due_date: t(now + i * D),
      }))
    );
    if (tErr) throw tErr;
  }

  console.log("→ Drafting Aarav's offer letter…");
  const { error: oErr } = await admin.from("offer_letters").insert({
    company_id: companyId,
    employee_id: byEmail[aaravEmail].id,
    letter_no: `TS/${new Date().getFullYear()}/001`,
    position: "Backend Developer",
    department: "Engineering",
    ctc_annual: 1400000,
    joining_date: t(now + 14 * D),
    status: "draft",
  });
  if (oErr) throw oErr;

  console.log("→ Creating login users…");
  async function makeUser(email, password, role) {
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name: byEmail[email].name },
    });
    if (error) throw error;
    const { error: pErr } = await admin.from("profiles").insert({
      id: data.user.id, company_id: companyId,
      employee_id: byEmail[email].id, role,
    });
    if (pErr) throw pErr;
  }
  await makeUser("priya.nair@" + DOMAIN, PASS.admin, "admin");
  await makeUser("rohan.mehta@" + DOMAIN, PASS.emp, "employee");
  await makeUser(aaravEmail, PASS.hire, "employee");

  const { count } = await admin.from("employees").select("id", { count: "exact", head: true }).eq("company_id", companyId);
  console.log(`✓ Done — ${count} employees, 3 logins, draft offer letter ready for Aarav Kapoor.`);
}

main().catch((e) => { console.error("SEED FAILED:", e.message); process.exit(1); });

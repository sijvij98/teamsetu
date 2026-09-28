/**
 * TeamSetu seed script — creates a real mid-size demo business.
 *
 * Creates:
 *  - Company: NexaFlow Technologies Pvt. Ltd. (100 employees)
 *  - 100 employees across 8 departments
 *  - 3 login users (admin, employee, new hire) with confirmed emails
 *  - Leave requests (pending + approved + history)
 *  - Onboarding tasks for 2 new joiners
 *  - 1 DRAFT offer letter for the new hire (Aarav Kapoor)
 *
 * Env vars (never commit these):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL,
 *   SEED_ADMIN_PASSWORD, SEED_EMP_PASSWORD, SEED_HIRE_PASSWORD
 *
 * Run: node scripts/seed.mjs
 */
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB = process.env.SUPABASE_DB_URL;
if (!URL || !SERVICE || !DB) {
  console.error("Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL");
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

const sql = postgres(DB, { ssl: "require", max: 1 });
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

/* ---------- split schema.sql into single statements (respects $$) ---------- */
function splitSql(text) {
  const noComments = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  const out = [];
  let cur = "", inDollar = false;
  for (let i = 0; i < noComments.length; i++) {
    if (noComments.startsWith("$$", i)) { inDollar = !inDollar; cur += "$$"; i++; continue; }
    if (noComments[i] === ";" && !inDollar) { if (cur.trim()) out.push(cur); cur = ""; continue; }
    cur += noComments[i];
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/* ---------- names & departments ---------- */
const FIRST_M = ["Aarav","Vihaan","Arjun","Rohan","Kabir","Aditya","Ishaan","Krishna","Vivaan","Aryan","Sai","Arnav","Rudra","Dhruv","Yash","Farhan","Imran","Zaid","Nikhil","Sahil","Manav","Dev","Ayaan","Rehan","Kunal","Varun","Siddharth","Pranav","Rahul","Amit"];
const FIRST_F = ["Diya","Sneha","Ananya","Priya","Ishita","Myra","Aadhya","Navya","Sara","Ira","Meera","Kavya","Riya","Anika","Shreya","Pooja","Nisha","Divya","Kiran","Lakshmi","Anjali","Ritu","Simran","Tanvi","Neha"];
const LAST = ["Sharma","Patel","Mehta","Iyer","Singh","Das","Malhotra","Nair","Kapoor","Bose","Reddy","Gupta","Khan","Verma","Joshi","Mishra","Agarwal","Kulkarni","Desai","Chopra","Pillai","Menon","Rao","Nair","Bhatt","Trivedi","Saxena","Chauhan","Yadav","Pandey","Kaur","Gill","Anand","Chandra","Dutta","Ghosh","Banerjee","Mukherjee","Sinha","Tiwari"];

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
  console.log("→ Running schema…");
  for (const stmt of splitSql(readFileSync(join(ROOT, "supabase", "schema.sql"), "utf8"))) {
    await sql.unsafe(stmt);
  }

  console.log("→ Clearing any previous NexaFlow seed…");
  const { data: { users } } = await admin.auth.admin.listUsers();
  for (const u of users || []) {
    if (u.email && u.email.endsWith("@" + DOMAIN)) {
      await admin.auth.admin.deleteUser(u.id);
    }
  }
  await sql`delete from public.companies where slug = 'nexaflow'`;

  console.log("→ Creating company…");
  const [company] = await sql`
    insert into public.companies (name, slug, plan)
    values ('NexaFlow Technologies Pvt. Ltd.', 'nexaflow', 'growth')
    returning id`;
  const companyId = company.id;

  console.log("→ Generating 100 employees…");
  const usedEmails = new Set();
  const employees = [];
  const emailFor = (first, last) => {
    let base = `${first}.${last}`.toLowerCase(), e = `${base}@${DOMAIN}`, i = 2;
    while (usedEmails.has(e)) { e = `${base}${i}@${DOMAIN}`; i++; }
    usedEmails.add(e);
    return e;
  };

  // Force-include the two staff who get logins
  employees.push({
    name: "Priya Nair", email: emailFor("Priya", "Nair"), phone: "+91 98200 11223",
    department: "People", title: "HR Manager", location: "Bangalore",
    joining_date: "2021-04-12", status: "active",
  });
  employees.push({
    name: "Rohan Mehta", email: emailFor("Rohan", "Mehta"), phone: "+91 98310 44556",
    department: "Engineering", title: "Engineering Manager", location: "Bangalore",
    joining_date: "2020-08-03", status: "active",
  });

  for (const [dept, count, roles] of DEPTS) {
    let made = dept === "Engineering" ? 1 : dept === "People" ? 1 : 0; // forced ones already counted
    while (made < count) {
      const female = rnd() < 0.42;
      const first = pick(female ? FIRST_F : FIRST_M);
      const last = pick(LAST);
      const join = new Date(Date.now() - Math.floor(rnd() * 3 * 365) * 86400000 - Math.floor(rnd() * 300) * 86400000);
      employees.push({
        name: `${first} ${last}`,
        email: emailFor(first, last),
        phone: `+91 ${Math.floor(6000000000 + rnd() * 3999999999)}`,
        department: dept,
        title: pick(roles),
        location: pick(LOCATIONS),
        joining_date: iso(join > new Date() ? new Date() : join),
        status: "active",
      });
      made++;
    }
  }

  // Mark a few as onboarding
  const onboardingIdx = new Set();
  while (onboardingIdx.size < 4) onboardingIdx.add(Math.floor(rnd() * employees.length));
  for (const i of onboardingIdx) {
    employees[i].status = "onboarding";
    employees[i].joining_date = iso(new Date(Date.now() + Math.floor(rnd() * 20 - 10) * 86400000));
  }

  const inserted = await sql`
    insert into public.employees ${sql(employees.map((e) => ({ ...e, company_id: companyId })))}
    returning id, email, name, status`;
  console.log(`  ${inserted.length} employees inserted`);
  const byEmail = Object.fromEntries(inserted.map((r) => [r.email, r]));

  console.log("→ Creating leave requests…");
  const ids = inserted.map((r) => r.id);
  const t = (d) => iso(new Date(d));
  const now = Date.now(), D = 86400000;
  const leaves = [
    { emp: ids[5], type: "Annual leave", from: t(now + 9 * D), to: t(now + 12 * D), reason: "Family trip", status: "pending" },
    { emp: ids[12], type: "Sick leave", from: t(now + 1 * D), to: t(now + 1 * D), reason: "Fever", status: "pending" },
    { emp: ids[20], type: "Work from home", from: t(now + 3 * D), to: t(now + 4 * D), reason: "", status: "pending" },
    { emp: ids[8], type: "Annual leave", from: t(now - 1 * D), to: t(now + 2 * D), reason: "Vacation", status: "approved" },
    { emp: ids[30], type: "Sick leave", from: t(now), to: t(now + 1 * D), reason: "", status: "approved" },
    { emp: ids[15], type: "Annual leave", from: t(now - 40 * D), to: t(now - 36 * D), reason: "Diwali break", status: "approved" },
    { emp: ids[22], type: "Casual leave", from: t(now - 12 * D), to: t(now - 12 * D), reason: "Personal work", status: "declined" },
    { emp: ids[41], type: "Annual leave", from: t(now - 60 * D), to: t(now - 55 * D), reason: "", status: "approved" },
  ];
  await sql`insert into public.leave_requests ${sql(leaves.map((l) => ({
    company_id: companyId, employee_id: l.emp, leave_type: l.type,
    from_date: l.from, to_date: l.to, reason: l.reason || null, status: l.status,
  })))}`;

  console.log("→ Creating onboarding tasks…");
  const ob = inserted.filter((r) => r.status === "onboarding").slice(0, 2);
  for (const o of ob) {
    await sql`insert into public.onboarding_tasks ${sql(ONBOARDING_TASKS.map((title, i) => ({
      company_id: companyId, employee_id: o.id, title,
      done: rnd() < 0.45,
      due_date: t(now + i * D),
    })))}`;
  }

  console.log("→ Creating login users…");
  async function makeUser(email, password, role, employeeEmail) {
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name: byEmail[employeeEmail].name },
    });
    if (error) throw error;
    await sql`insert into public.profiles (id, company_id, employee_id, role)
      values (${data.user.id}, ${companyId}, ${byEmail[employeeEmail].id}, ${role})`;
    return data.user;
  }

  // The new hire: Aarav Kapoor (offer letter + onboarding demo)
  const aaravEmail = emailFor("Aarav", "Kapoor");
  const [aarav] = await sql`insert into public.employees
    (company_id, name, email, phone, department, title, location, joining_date, status)
    values (${companyId}, 'Aarav Kapoor', ${aaravEmail}, '+91 98110 45678',
      'Engineering', 'Backend Developer', 'Bangalore', ${t(now + 14 * D)}, 'offered')
    returning id`;
  byEmail[aaravEmail] = { id: aarav.id, email: aaravEmail, name: "Aarav Kapoor", status: "offered" };

  await sql`insert into public.offer_letters
    (company_id, employee_id, letter_no, position, department, ctc_annual, joining_date, status)
    values (${companyId}, ${aarav.id}, ${"TS/" + new Date().getFullYear() + "/001"},
      'Backend Developer', 'Engineering', 1400000, ${t(now + 14 * D)}, 'draft')`;

  await makeUser("priya.nair@" + DOMAIN, PASS.admin, "admin", "priya.nair@" + DOMAIN);
  await makeUser("rohan.mehta@" + DOMAIN, PASS.emp, "employee", "rohan.mehta@" + DOMAIN);
  await makeUser(aaravEmail, PASS.hire, "employee", aaravEmail);

  const [{ count }] = await sql`select count(*)::int as count from public.employees where company_id = ${companyId}`;
  console.log(`✓ Done — ${count} employees, 3 logins, offer letter drafted for Aarav Kapoor.`);
  await sql.end();
}

main().catch(async (e) => { console.error("SEED FAILED:", e.message); try { await sql.end(); } catch {} process.exit(1); });

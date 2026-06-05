import bcrypt from "bcrypt";
import "dotenv/config";
import mongoose from "mongoose";
import AggregatePagination from "mongoose-aggregate-paginate-v2";

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("MONGO_URL is not set in .env");
  process.exit(1);
}
const commonFields = {
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, immutable: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  status: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    refreshTokens: { type: [String], default: [] },
    status: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    ...commonFields,
  },
  { collection: "users", timestamps: false },
);
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
userSchema.plugin(AggregatePagination);

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ...commonFields,
  },
  { collection: "boards", timestamps: false },
);
boardSchema.plugin(AggregatePagination);

const columnSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    order: { type: Number, default: 0 },
    ...commonFields,
  },
  { collection: "columns", timestamps: false },
);
columnSchema.plugin(AggregatePagination);

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    columnId: { type: mongoose.Schema.Types.ObjectId, ref: "Column", required: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    dueDate: { type: Date, default: null },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
    order: { type: Number, default: 0 },
    ...commonFields,
  },
  { collection: "cards", timestamps: false },
);
cardSchema.plugin(AggregatePagination);

const User = mongoose.model("SeedUser", userSchema);
const Board = mongoose.model("SeedBoard", boardSchema);
const Column = mongoose.model("SeedColumn", columnSchema);
const Card = mongoose.model("SeedCard", cardSchema);

const hash = (pwd) => bcrypt.hash(pwd, 10);

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
async function upsert(Model, filter, doc, label) {
  const result = await Model.findOneAndUpdate(
    { ...filter, deleted: false },
    { $setOnInsert: doc },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return result;
}

const PLAIN_PASSWORD = "Password@123";

const RAW_USERS = [
  { name: "Alice Johnson", email: "alice@taskflow.dev", role: "owner" },
  { name: "Bob Martinez", email: "bob@taskflow.dev", role: "member" },
  { name: "Clara Singh", email: "clara@taskflow.dev", role: "member" },
  { name: "David Kim", email: "david@taskflow.dev", role: "member" },
];

const BOARD_DEFS = [
  {
    title: "Product Roadmap",
    description: "High-level feature planning and release milestones.",
    ownerIndex: 0,
    memberIndexes: [0, 1, 2],
    columns: [
      {
        title: "Backlog",
        cards: [
          {
            title: "User authentication flow",
            description: "Design and implement sign-up / login with JWT.",
            priority: "HIGH",
            dueDays: 10,
            assigneeIndex: 1,
          },
          {
            title: "Dashboard analytics widget",
            description: "Show task completion rate and burn-down chart.",
            priority: "MEDIUM",
            dueDays: 20,
            assigneeIndex: 2,
          },
          {
            title: "Dark mode support",
            description: "Add CSS variables and a toggle switch.",
            priority: "LOW",
            dueDays: 30,
            assigneeIndex: null,
          },
          {
            title: "Email notification service",
            description: "Send digest emails when tasks are assigned or due.",
            priority: "MEDIUM",
            dueDays: 15,
            assigneeIndex: 1,
          },
        ],
      },
      {
        title: "In Progress",
        cards: [
          {
            title: "Kanban drag-and-drop",
            description: "Implement @dnd-kit sortable for columns and cards.",
            priority: "HIGH",
            dueDays: 5,
            assigneeIndex: 0,
          },
          {
            title: "REST API for boards",
            description: "CRUD endpoints with Joi validation.",
            priority: "HIGH",
            dueDays: 3,
            assigneeIndex: 1,
          },
          {
            title: "Socket.io real-time sync",
            description: "Broadcast card moves to all board members.",
            priority: "URGENT",
            dueDays: 2,
            assigneeIndex: 2,
          },
        ],
      },
      {
        title: "In Review",
        cards: [
          {
            title: "Unit tests for auth service",
            description: "Cover register, login and refresh-token paths.",
            priority: "MEDIUM",
            dueDays: 7,
            assigneeIndex: 0,
          },
          {
            title: "API rate limiting",
            description: "Apply express-rate-limit on auth endpoints.",
            priority: "LOW",
            dueDays: 12,
            assigneeIndex: 1,
          },
        ],
      },
      {
        title: "Done",
        cards: [
          {
            title: "Project scaffolding",
            description: "Set up monorepo with Next.js and Express.",
            priority: "HIGH",
            dueDays: -5,
            assigneeIndex: 0,
          },
          {
            title: "MongoDB schema design",
            description: "Define User, Board, Column, Card schemas.",
            priority: "HIGH",
            dueDays: -3,
            assigneeIndex: 1,
          },
          {
            title: "CI/CD pipeline",
            description: "GitHub Actions deploy to staging on merge.",
            priority: "MEDIUM",
            dueDays: -1,
            assigneeIndex: 2,
          },
        ],
      },
    ],
  },
  {
    title: "Marketing Website",
    description: "Landing page redesign and content updates.",
    ownerIndex: 1,
    memberIndexes: [1, 2, 3],
    columns: [
      {
        title: "To Do",
        cards: [
          {
            title: "Write homepage copy",
            description: "Hero section, feature highlights, and CTA text.",
            priority: "HIGH",
            dueDays: 8,
            assigneeIndex: 2,
          },
          {
            title: "Design new logo",
            description: "SVG logo with light and dark variants.",
            priority: "MEDIUM",
            dueDays: 14,
            assigneeIndex: 3,
          },
          {
            title: "SEO meta tags audit",
            description: "Ensure all pages have correct OG and meta tags.",
            priority: "LOW",
            dueDays: 21,
            assigneeIndex: null,
          },
        ],
      },
      {
        title: "In Progress",
        cards: [
          {
            title: "Responsive navbar",
            description: "Mobile-first navigation with hamburger menu.",
            priority: "HIGH",
            dueDays: 4,
            assigneeIndex: 1,
          },
          {
            title: "Blog section template",
            description: "MDX-based blog with syntax highlighting.",
            priority: "MEDIUM",
            dueDays: 9,
            assigneeIndex: 2,
          },
        ],
      },
      {
        title: "Done",
        cards: [
          {
            title: "Hosting setup",
            description: "Deploy to Vercel with custom domain.",
            priority: "HIGH",
            dueDays: -2,
            assigneeIndex: 1,
          },
          {
            title: "Analytics integration",
            description: "Add Google Analytics 4 and cookie banner.",
            priority: "LOW",
            dueDays: -4,
            assigneeIndex: 3,
          },
        ],
      },
    ],
  },
  {
    title: "Mobile App — iOS & Android",
    description: "React Native cross-platform app for TaskFlow.",
    ownerIndex: 2,
    memberIndexes: [0, 2, 3],
    columns: [
      {
        title: "Sprint 1",
        cards: [
          {
            title: "Navigation stack setup",
            description: "Bottom tabs and stack navigator with React Navigation.",
            priority: "HIGH",
            dueDays: 6,
            assigneeIndex: 3,
          },
          {
            title: "Login screen UI",
            description: "Match the web design with native inputs.",
            priority: "HIGH",
            dueDays: 4,
            assigneeIndex: 0,
          },
          {
            title: "Push notification permissions",
            description: "Request and store FCM token on first launch.",
            priority: "MEDIUM",
            dueDays: 10,
            assigneeIndex: 2,
          },
        ],
      },
      {
        title: "Sprint 2",
        cards: [
          {
            title: "Offline mode with MMKV",
            description: "Cache board data locally; sync on reconnect.",
            priority: "URGENT",
            dueDays: 3,
            assigneeIndex: 3,
          },
          {
            title: "Swipe-to-delete cards",
            description: "Swipeable row component with haptic feedback.",
            priority: "LOW",
            dueDays: 18,
            assigneeIndex: 0,
          },
        ],
      },
      {
        title: "Blocked",
        cards: [
          {
            title: "App Store review submission",
            description: "Waiting for legal sign-off on privacy policy.",
            priority: "URGENT",
            dueDays: 1,
            assigneeIndex: 2,
          },
        ],
      },
      {
        title: "Released",
        cards: [
          {
            title: "Splash screen",
            description: "Animated logo on cold start.",
            priority: "LOW",
            dueDays: -10,
            assigneeIndex: 0,
          },
          {
            title: "Basic board list screen",
            description: "Fetch and display boards from REST API.",
            priority: "HIGH",
            dueDays: -7,
            assigneeIndex: 3,
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log("TaskFlow seed script startin ..............");

  await mongoose.connect(MONGO_URL, { minPoolSize: 2, maxPoolSize: 10 });
  console.log("Connected to MongoDB ");

  console.log("Seeding users…");
  const hashedPwd = await hash(PLAIN_PASSWORD);
  const systemId = new mongoose.Types.ObjectId();

  const userDocs = [];
  for (const u of RAW_USERS) {
    const doc = await upsert(
      User,
      { email: u.email },
      {
        name: u.name,
        email: u.email,
        password: hashedPwd,
        status: true,
        deleted: false,
        createdBy: systemId,
        updatedBy: systemId,
      },
      u.email,
    );
    userDocs.push(doc);
    console.log(`   • ${u.name} <${u.email}>`);
  }

  for (const boardDef of BOARD_DEFS) {
    const owner = userDocs[boardDef.ownerIndex];
    const members = boardDef.memberIndexes.map((i) => userDocs[i]._id);

    console.log(` Board: "${boardDef.title}"`);

    const board = await upsert(
      Board,
      { title: boardDef.title, ownerId: owner._id },
      {
        title: boardDef.title,
        description: boardDef.description,
        ownerId: owner._id,
        members,
        deleted: false,
        createdBy: owner._id,
        updatedBy: owner._id,
      },
    );

    for (let colIdx = 0; colIdx < boardDef.columns.length; colIdx++) {
      const colDef = boardDef.columns[colIdx];

      const column = await upsert(
        Column,
        { title: colDef.title, boardId: board._id },
        {
          title: colDef.title,
          boardId: board._id,
          order: colIdx,
          deleted: false,
          createdBy: owner._id,
          updatedBy: owner._id,
        },
      );

      console.log(`   ┣ Column: "${colDef.title}" (${colDef.cards.length} cards)`);

      for (let cardIdx = 0; cardIdx < colDef.cards.length; cardIdx++) {
        const cardDef = colDef.cards[cardIdx];
        const assigneeId = cardDef.assigneeIndex !== null ? userDocs[cardDef.assigneeIndex]._id : null;

        await upsert(
          Card,
          { title: cardDef.title, columnId: column._id },
          {
            title: cardDef.title,
            description: cardDef.description,
            columnId: column._id,
            boardId: board._id,
            assigneeId,
            priority: cardDef.priority,
            dueDate: daysFromNow(cardDef.dueDays),
            order: cardIdx,
            deleted: false,
            createdBy: owner._id,
            updatedBy: owner._id,
          },
        );
      }
    }
  }

  const [uCount, bCount, colCount, cCount] = await Promise.all([
    User.countDocuments({ deleted: false }),
    Board.countDocuments({ deleted: false }),
    Column.countDocuments({ deleted: false }),
    Card.countDocuments({ deleted: false }),
  ]);

  console.log("\n─────────────────────────────────────");
  console.log("  Database summary after seed:");
  console.log(`   Users   : ${uCount}`);
  console.log(`   Boards  : ${bCount}`);
  console.log(`   Columns : ${colCount}`);
  console.log(`   Cards   : ${cCount}`);
  console.log("─────────────────────────────────────");

  console.log("Login credentials for all seed users:");
  console.log(`   Password : ${PLAIN_PASSWORD}`);
  RAW_USERS.forEach((u) => console.log(`   ${u.email}`));

  console.log("Seed complete.\n");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("  Seed failed:", err.message);
  mongoose.disconnect();
  process.exit(1);
});

import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// dado que vamos a buscar mucho por el clerkId le agregamos un index (3er parameter of pgTAble and it is a callback, t es table, asinto)
// Tmb podriamos haber usado varchar, text seguramente ocupen más
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    // TODO: add banner fields
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)],
);
export const userRelations = relations(users, ({ many }) => ({
  video: many(videos),
}));
// la convencion para un index es field_idx (luego name_idx)
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("name_idx").on(t.name)],
);
export const categoryRelations = relations(categories, ({ many }) => ({
  video: many(videos),
}));

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade", //ojo, User es padre de esta entidad (la que tiene la referencia es hija, asi que es cuando se borre un usuario que se borrarían sus videos, no al revés)
    })
    .notNull(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null", // obviously if we delete a category we don't want to delete videos
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// relations have a higher level of abstraction as foreignKeys have.They only define relations between tables, they don't create foreign keys. They can be used together since this only works at application level
export const videoRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));

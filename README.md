# Story Weaver AI

Act as a Senior Software Architect, Senior UI/UX Designer, Senior Full-Stack Engineer, AI Engineer, and DevOps Engineer.

Your task is to design and build a modern, production-ready SaaS platform called "StoryForge AI".

====================================================

PROJECT OVERVIEW

====================================================

StoryForge AI is an AI-powered storytelling platform where users can create complete fictional worlds using Artificial Intelligence.

The platform should allow users to generate:

• Stories

• Characters

• Worlds

• Dialogues

• Comics

• AI Images

• Interactive Adventures

• Audiobooks

• Story Timelines

The application must be scalable, secure, responsive, beautiful, and production-ready.

This is NOT a simple CRUD application.

The platform should feel like a premium AI product comparable to Notion AI, Canva AI, Midjourney, and ChatGPT.

====================================================

TECH STACK

====================================================

Frontend

• Next.js 15 (App Router)

• React 19

• TypeScript

• Tailwind CSS

• shadcn/ui

• Framer Motion

• React Hook Form

• Zod

• TanStack Query

• Zustand

• React Markdown

• TipTap Rich Text Editor

Backend

• Next.js API Routes / Server Actions

• TypeScript

Database

Use Supabase.

Specifically:

• PostgreSQL

• Supabase Authentication

• Supabase Storage

• Row Level Security (RLS)

• Realtime

• Edge Functions (if necessary)

Never use Firebase.

====================================================

AUTHENTICATION

====================================================

Implement Supabase Auth.

Support:

• Email + Password

• Google Login

• GitHub Login

• Password Reset

• Email Verification

Each user has:

User ID

Username

Display Name

Avatar

Subscription

Credits

Language

Dark Mode Preference

Creation Date

====================================================

DATABASE DESIGN

====================================================

Design a professional relational PostgreSQL database.

Include all required tables.

Examples include:

users

stories

chapters

characters

character_images

worlds

locations

timelines

dialogues

comic_projects

comic_panels

panel_images

story_choices

story_versions

prompts

bookmarks

favorites

comments

likes

notifications

subscriptions

payments

credit_usage

generated_images

audio_books

voices

exports

activity_logs

api_keys

user_settings

analytics

Every table should include:

UUID primary key

created_at

updated_at

soft delete support where appropriate

Indexes

Foreign Keys

RLS policies

====================================================

HOME PAGE

====================================================

Modern landing page.

Sections:

Hero

Features

How It Works

Examples

Testimonials

Pricing

FAQ

Footer

Animations

Glassmorphism

Dark Mode

Responsive

====================================================

USER DASHBOARD

====================================================

Beautiful dashboard.

Sidebar

Home

Stories

Characters

World Builder

Comics

Images

Audiobooks

Templates

Favorites

History

Settings

Billing

Profile

====================================================

AI STORY GENERATOR

====================================================

The user enters:

Story Idea

Genre

Tone

Audience

Length

Characters

Language

Writing Style

Reading Level

AI generates:

Title

Cover

Summary

Outline

Chapters

Ending

Plot Twists

Story Metadata

====================================================

CHARACTER GENERATOR

====================================================

Generate:

Name

Age

Occupation

Appearance

Backstory

Strengths

Weaknesses

Skills

Goals

Relationships

Personality

Clothing

Voice Style

Generate AI Portrait.

Save every version.

====================================================

WORLD BUILDER

====================================================

Generate:

Kingdoms

Countries

Cities

Villages

Maps

History

Religion

Politics

Technology

Magic

Climate

Population

Economy

====================================================

DIALOGUE GENERATOR

====================================================

Generate realistic conversations.

Support emotions.

Happy

Sad

Romantic

Funny

Angry

Suspense

Fear

====================================================

COMIC GENERATOR

====================================================

Convert stories into comics.

Generate:

Panels

Speech Bubbles

Narration

Camera Angles

Expressions

Backgrounds

Comic Pages

Panel Layout

====================================================

IMAGE GENERATION

====================================================

Generate:

Characters

Cities

Weapons

Creatures

Vehicles

Buildings

Magic

Landscapes

Keep consistent style across all images belonging to the same project.

====================================================

INTERACTIVE STORIES

====================================================

Branching stories.

Choices.

Multiple endings.

Story graph visualization.

====================================================

AUDIOBOOKS

====================================================

Generate narration.

Support multiple voices.

Background music.

Chapter navigation.

Bookmarks.

====================================================

EDITOR

====================================================

Professional writing editor.

Autosave

Undo

Redo

Version History

Comments

Track Changes

Spell Check

Grammar Suggestions

Word Count

Reading Time

====================================================

EXPORT

====================================================

Allow exporting to:

PDF

DOCX

Markdown

HTML

ePub

Comic PDF

JSON

====================================================

SEARCH

====================================================

Global Search.

Search:

Stories

Characters

Worlds

Dialogues

Images

====================================================

AI FEATURES

====================================================

Implement:

Story Continuation

Story Improvement

Grammar Correction

Character Consistency

Timeline Validation

Plot Hole Detection

Emotion Analysis

Writing Style Suggestions

Idea Generator

Title Generator

Cover Generator

Chapter Expansion

Dialogue Rewrite

Story Translation

====================================================

PRICING

====================================================

Free

Basic

Pro

Studio

Include:

Credits

Monthly Limits

Billing

Usage Tracking

====================================================

ADMIN PANEL

====================================================

Dashboard

Users

Stories

Reports

Payments

Subscriptions

Analytics

Moderation

Feature Flags

Logs

====================================================

SUPABASE

====================================================

Use:

Supabase Auth

Supabase Storage

Supabase PostgreSQL

Supabase Realtime

Supabase RLS

Supabase Database Functions

Supabase Edge Functions if required

Write SQL migrations.

Generate the full schema.

Generate indexes.

Generate RLS policies.

====================================================

SECURITY

====================================================

Implement:

Authentication

Authorization

Rate Limiting

Input Validation

XSS Protection

CSRF Protection

SQL Injection Prevention

Secure File Upload

Audit Logs

====================================================

PERFORMANCE

====================================================

Implement:

Lazy Loading

Infinite Scroll

Pagination

Caching

Image Optimization

Streaming

Code Splitting

Server Components

Optimistic Updates

====================================================

ACCESSIBILITY

====================================================

Meet WCAG 2.2 AA standards.

Keyboard Navigation.

Screen Reader Support.

High Contrast.

====================================================

TESTING

====================================================

Write:

Unit Tests

Integration Tests

End-to-End Tests

====================================================

DELIVERABLES

====================================================

Build the project step by step.

For each step provide:

1. Folder Structure

2. Architecture Diagram

3. Database Schema

4. SQL Migration

5. API Design

6. UI Design

7. Components

8. Backend Logic

9. Supabase Integration

10. Authentication

11. Security

12. Testing

13. Deployment

14. Documentation

Do not skip any step.

Always use clean architecture, reusable components, modern coding standards, scalable design patterns, and production-ready code.

Whenever possible, explain why a particular design choice is made before implementing it.

The final application should be polished enough to be deployed as a commercial SaaS product.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fdf7fd62-31ce-4cbe-8697-44580da26850).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

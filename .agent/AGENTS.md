# AGENTS.md

Panduan kerja untuk AI agent, developer, atau contributor yang membantu mengembangkan proyek ini.

Project ini adalah aplikasi **Next.js** berbasis **static-first**, menggunakan **shadcn/ui** sebagai komponen UI utama. Saat ini **belum menggunakan database**.

---

## 1. Project Context

Aplikasi ini dibangun dengan:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Static-first architecture
- Tanpa database untuk tahap awal

Prioritas utama project:

1. Struktur kode rapi dan mudah dikembangkan.
2. UI konsisten menggunakan komponen shadcn/ui.
3. Konten dan data awal disimpan secara statis.
4. Mudah dimigrasikan ke database di masa depan.
5. Performa bagus, SEO-friendly, dan maintainable.

---

## 2. Core Rules

Saat mengerjakan project ini:

- Gunakan **TypeScript** untuk semua file baru.
- Gunakan **App Router** Next.js.
- Gunakan **Server Components by default**.
- Gunakan Client Components hanya jika benar-benar butuh interaktivitas.
- Gunakan komponen dari **shadcn/ui** sebelum membuat komponen custom.
- Jangan menambahkan database, ORM, auth provider, atau backend service tanpa instruksi eksplisit.
- Jangan membuat abstraction berlebihan untuk fitur yang masih sederhana.
- Jangan hardcode style yang seharusnya memakai Tailwind utility atau design token.
- Jangan install dependency baru kecuali benar-benar perlu.

---

## 3. Recommended Directory Structure

Gunakan struktur berikut:

```txt
src/
  app/
    page.tsx
    layout.tsx
    globals.css

  components/
    ui/
      button.tsx
      card.tsx
      input.tsx
      ...
    shared/
      header.tsx
      footer.tsx
      section-heading.tsx
    sections/
      hero-section.tsx
      feature-section.tsx
      pricing-section.tsx
      faq-section.tsx

  data/
    site.ts
    navigation.ts
    features.ts
    pricing.ts
    faq.ts

  lib/
    utils.ts
    constants.ts

  types/
    index.ts

public/
  images/
```

Jika project tidak memakai src/, struktur yang sama boleh diterapkan langsung di root:

app/
components/
data/
lib/
types/
public/ 4. Next.js Best Practices
Server Components

Default semua komponen sebagai Server Component.

export default function Page() {
return <main>Content</main>;
}

Gunakan "use client" hanya jika butuh:

useState
useEffect
event handler kompleks
form interaktif
dialog, dropdown, tabs, carousel, atau komponen interaktif lain

Jangan asal menambahkan "use client" di file page atau layout.

Routing

Gunakan App Router:

app/
page.tsx
about/
page.tsx
contact/
page.tsx

Untuk metadata, gunakan export metadata:

import type { Metadata } from "next";

export const metadata: Metadata = {
title: "Page Title",
description: "Page description",
};
Static-first Data

Karena belum ada database, simpan data di folder data/.

Contoh:

// src/data/features.ts

export const features = [
{
title: "Belajar Logika",
description: "Materi dirancang untuk melatih pola pikir problem solving.",
},
{
title: "Coding untuk Anak",
description: "Pembelajaran coding visual dan interaktif.",
},
];

Gunakan data ini di komponen:

import { features } from "@/data/features";

export function FeatureSection() {
return (
<section>
{features.map((feature) => (
<div key={feature.title}>
<h3>{feature.title}</h3>
<p>{feature.description}</p>
</div>
))}
</section>
);
}

Jangan menyimpan data panjang langsung di JSX jika data itu mungkin berubah.

5. shadcn/ui Rules

Gunakan shadcn/ui untuk elemen UI umum seperti:

Button
Card
Input
Textarea
Dialog
Sheet
Accordion
Tabs
Badge
Dropdown Menu
Form
Separator

Contoh:

import { Button } from "@/components/ui/button";
import {
Card,
CardContent,
CardHeader,
CardTitle,
} from "@/components/ui/card";

export function ExampleCard() {
return (
<Card>
<CardHeader>
<CardTitle>Judul Card</CardTitle>
</CardHeader>
<CardContent>
<p>Isi card.</p>
<Button>Mulai</Button>
</CardContent>
</Card>
);
}

Jangan membuat ulang komponen yang sudah tersedia di shadcn/ui kecuali ada kebutuhan desain khusus.

6. Component Guidelines

Komponen harus:

Kecil dan fokus.
Mudah dibaca.
Menggunakan props yang jelas.
Tidak mencampur terlalu banyak logic dan UI.
Menggunakan nama yang deskriptif.

Contoh nama yang baik:

HeroSection
FeatureSection
PricingCard
FAQAccordion
ContactForm
SiteHeader
SiteFooter

Hindari nama seperti:

Box
Thing
Content
MainComponent
CustomSection 7. Styling Guidelines

Gunakan Tailwind CSS.

Prioritas styling:

Utility class Tailwind.
Variant dari shadcn/ui.
Helper cn() dari lib/utils.ts.
CSS global hanya untuk base style.

Contoh:

import { cn } from "@/lib/utils";

type SectionProps = {
className?: string;
children: React.ReactNode;
};

export function Section({ className, children }: SectionProps) {
return (
<section className={cn("mx-auto max-w-6xl px-4 py-16", className)}>
{children}
</section>
);
}

Hindari inline style:

<div style={{ marginTop: 20 }} />

Gunakan Tailwind:

<div className="mt-5" />
8. Static Content Strategy

Untuk tahap awal tanpa database:

Simpan konten marketing di data/.
Simpan konfigurasi site di data/site.ts.
Simpan gambar di public/images/.
Gunakan array/object TypeScript untuk data yang berulang.
Buat tipe data di types/ jika struktur data mulai kompleks.

Contoh:

// src/data/site.ts

export const siteConfig = {
name: "Nama Brand",
description: "Deskripsi singkat website.",
url: "https://example.com",
ogImage: "/images/og-image.jpg",
links: {
instagram: "https://instagram.com/example",
whatsapp: "https://wa.me/6281234567890",
},
}; 9. Future Database Readiness

Walaupun belum ada database, tulis kode agar mudah dimigrasikan nanti.

Bagus:

import { programs } from "@/data/programs";

export function getPrograms() {
return programs;
}

Lebih baik daripada import data langsung di banyak tempat.

Untuk data penting, boleh buat layer sederhana:

src/
lib/
queries/
programs.ts

Contoh:

// src/lib/queries/programs.ts

import { programs } from "@/data/programs";

export function getPrograms() {
return programs;
}

export function getProgramBySlug(slug: string) {
return programs.find((program) => program.slug === slug);
}

Dengan pola ini, nanti sumber data bisa diganti dari static file ke database tanpa rewrite besar-besaran.

10. Forms

Jika project belum punya backend/database:

Jangan membuat form yang pura-pura menyimpan data.
Untuk contact form, gunakan opsi sederhana:
WhatsApp link
mailto link
external form service jika diminta
Jelaskan fallback behavior di kode jika perlu.

Contoh CTA WhatsApp:

import { Button } from "@/components/ui/button";

export function ContactCTA() {
return (
<Button asChild>
<a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
Hubungi via WhatsApp
</a>
</Button>
);
} 11. SEO Guidelines

Setiap halaman penting harus punya metadata:

import type { Metadata } from "next";

export const metadata: Metadata = {
title: "Coding Class for Kids",
description: "Kelas coding dan logic untuk anak-anak.",
};

Gunakan heading secara benar:

h1: satu kali per halaman
h2: section utama
h3: subsection/card

Jangan gunakan heading hanya untuk styling. Styling harus diatur dengan class Tailwind.

12. Accessibility

Pastikan:

Button yang navigasi memakai <a> dengan Button asChild.
Gambar informatif punya alt.
Gambar dekoratif boleh alt="".
Form input punya label.
Dialog, dropdown, accordion menggunakan shadcn/ui agar aksesibilitas lebih aman.
Jangan hilangkan focus ring tanpa pengganti.

Contoh:

<Button asChild>
  <a href="/programs">Lihat Program</a>
</Button>
13. Image Guidelines

Gunakan next/image untuk gambar penting.

import Image from "next/image";

export function HeroImage() {
return (
<Image
      src="/images/hero.jpg"
      alt="Anak belajar coding"
      width={800}
      height={600}
      priority
    />
);
}

Gunakan priority hanya untuk gambar above-the-fold seperti hero image.

14. Performance Rules
    Jangan membuat semua komponen menjadi Client Component.
    Jangan import library besar tanpa alasan kuat.
    Jangan gunakan gambar berukuran besar tanpa optimasi.
    Pecah section besar menjadi komponen kecil.
    Gunakan static rendering selama memungkinkan.
    Hindari fetching client-side untuk data statis.
15. Naming Convention

Gunakan:

kebab-case untuk file
PascalCase untuk component
camelCase untuk variable/function
UPPER_SNAKE_CASE untuk constant global

Contoh:

hero-section.tsx
pricing-card.tsx
site-header.tsx
export function HeroSection() {}
export function PricingCard() {} 16. Import Rules

Gunakan absolute import jika sudah dikonfigurasi:

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

Hindari import relatif yang terlalu panjang:

import { Button } from "../../../components/ui/button"; 17. Code Quality

Sebelum menyelesaikan perubahan, pastikan:

npm run lint
npm run build

Jika menggunakan pnpm:

pnpm lint
pnpm build

Jika menggunakan bun:

bun run lint
bun run build

Jangan abaikan error TypeScript, lint, atau build.

18. Dependency Rules

Jangan menambahkan dependency baru kecuali:

Fitur tidak bisa dibuat dengan bawaan Next.js/React/shadcn.
Dependency tersebut kecil dan aktif dirawat.
Ada alasan jelas kenapa dependency itu diperlukan.

Sebelum install dependency, pertimbangkan:

Apakah shadcn/ui sudah punya komponennya?
Apakah bisa dibuat sederhana dengan React?
Apakah dependency ini akan menambah beban maintenance? 19. Content Editing Rules

Saat mengubah teks website:

Simpan teks reusable di data/.
Jangan menaruh copy panjang langsung di banyak komponen.
Gunakan bahasa yang konsisten.
Hindari klaim berlebihan.
Jangan membuat testimoni, angka, partner, atau pencapaian palsu.

Kalau belum ada data nyata, gunakan wording netral.

Buruk:

Dipercaya oleh 10.000+ siswa

Jika belum terbukti, gunakan:

Dirancang untuk membantu anak belajar logika dan coding secara bertahap. 20. Recommended Components

Untuk website statis awal, buat komponen berikut:

components/shared/site-header.tsx
components/shared/site-footer.tsx
components/shared/section.tsx
components/shared/section-heading.tsx

components/sections/hero-section.tsx
components/sections/program-section.tsx
components/sections/benefit-section.tsx
components/sections/pricing-section.tsx
components/sections/faq-section.tsx
components/sections/contact-section.tsx 21. Example Page Structure
import { HeroSection } from "@/components/sections/hero-section";
import { ProgramSection } from "@/components/sections/program-section";
import { BenefitSection } from "@/components/sections/benefit-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { FAQSection } from "@/components/sections/faq-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function HomePage() {
return (
<main>
<HeroSection />
<ProgramSection />
<BenefitSection />
<PricingSection />
<FAQSection />
<ContactSection />
</main>
);
} 22. Things Not To Do

Jangan:

Menambahkan database sebelum diperlukan.
Menambahkan Prisma, Drizzle, Supabase, Firebase, atau Auth.js tanpa instruksi.
Membuat custom button sendiri jika shadcn Button cukup.
Menggunakan "use client" di semua file.
Menaruh semua section dalam satu file besar.
Menaruh data statis berulang langsung di JSX.
Menambahkan animasi berlebihan.
Mengorbankan accessibility demi tampilan.
Membuat copy marketing yang tidak bisa dibuktikan.
Menggunakan dependency hanya karena populer. 23. Preferred Implementation Mindset

Bangun versi sederhana yang benar dulu.

Urutan prioritas:

Struktur benar.
UI konsisten.
Konten mudah diedit.
SEO dasar rapi.
Accessibility aman.
Baru tambah interaktivitas jika perlu.

Jangan over-engineer. Project ini belum punya database, jadi jangan berpura-pura seperti aplikasi enterprise.

Buat fondasi yang bersih, bukan arsitektur yang sok kompleks.

24. Agent Workflow

Saat AI agent mengerjakan task:

Pahami scope perubahan.
Cek struktur project yang ada.
Gunakan pola yang sudah ada.
Tambahkan komponen kecil dan reusable.
Gunakan shadcn/ui bila relevan.
Simpan data statis di data/.
Jalankan lint/build jika memungkinkan.
Jelaskan perubahan secara ringkas.

Jika ada ketidakjelasan, ambil keputusan yang paling sederhana, aman, dan mudah diubah nanti.

25. Final Standard

Kode yang diterima harus:

Type-safe.
Readable.
Static-first.
Tidak over-engineered.
Menggunakan shadcn/ui secara konsisten.
Mudah dikembangkan ke database di masa depan.
Bisa lolos lint dan build.

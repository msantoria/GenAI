import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function createAthlete(formData: FormData) {
  'use server';
  const name = formData.get('name')?.toString() || '';
  const ageBand = formData.get('ageBand')?.toString() as any;
  const sportFocus = formData.get('sportFocus')?.toString() || '';
  const parentEmail = formData.get('parentEmail')?.toString() || undefined;
  const programId = Number(formData.get('programId'));
  const consent = formData.get('consent') === 'on';
  const baselineDate = formData.get('baselineDate')?.toString();

  if (!name || !ageBand || !sportFocus || !programId || !consent) {
    throw new Error('Missing required fields or consent');
  }

  await prisma.athlete.create({
    data: {
      name,
      ageBand,
      sportFocus,
      parentEmail,
      baselineDate: baselineDate ? new Date(baselineDate) : null,
      consent,
      programId
    }
  });

  revalidatePath('/athletes');
  redirect('/athletes');
}

export default async function NewAthletePage() {
  const programs = await prisma.program.findMany();
  return (
    <div className="card space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create Athlete</h1>
        <p className="text-sm text-gray-400">Collect minimal info + consent to start a Picture Day.</p>
      </div>
      <form action={createAthlete} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="label">Name</span>
          <input name="name" className="input" required />
        </label>
        <label className="space-y-1">
          <span className="label">Age band</span>
          <select name="ageBand" className="input" required>
            <option value="AGE_8_10">8-10</option>
            <option value="AGE_11_13">11-13</option>
            <option value="AGE_14_18">14-18</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Sport focus</span>
          <select name="sportFocus" className="input" required>
            <option>basketball</option>
            <option>soccer</option>
            <option>baseball</option>
            <option>general athleticism</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Program</span>
          <select name="programId" className="input" required defaultValue={programs[0]?.id}>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Parent email (optional)</span>
          <input name="parentEmail" type="email" className="input" />
        </label>
        <label className="space-y-1">
          <span className="label">Baseline date</span>
          <input name="baselineDate" type="date" className="input" />
        </label>
        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" name="consent" className="h-4 w-4" required />
          <span className="text-sm text-gray-300">I have consent to capture and analyze this athlete.</span>
        </label>
        <div className="md:col-span-2">
          <button className="button" type="submit">
            Save athlete
          </button>
        </div>
      </form>
    </div>
  );
}

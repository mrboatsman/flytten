import type { PageServerLoad } from './$types';
import { getDb, ensureSchema, hamtaPublicerade, raknaKandidater, hamtaNyckeltal } from '$lib/server/db';
import { fall as seedFall, nyckeltal as seedNyckeltal, meta } from '$lib/data';

export const load: PageServerLoad = async () => {
	const db = getDb();

	// Utan DATABASE_URL (t.ex. `npm run dev` utan Postgres) serveras seed-datat
	// direkt från src/lib/data.ts.
	if (!db) {
		return {
			fall: seedFall,
			nyckeltal: seedNyckeltal,
			kandidater: 0,
			uppdaterad: meta.uppdaterad,
			datakalla: 'seed' as const
		};
	}

	await ensureSchema(db);
	const [fall, nyckeltal, kandidater] = await Promise.all([
		hamtaPublicerade(db),
		hamtaNyckeltal(db),
		raknaKandidater(db)
	]);
	const uppdaterad = fall.reduce((max, f) => (f.skapad > max ? f.skapad : max), '').slice(0, 10);

	return {
		fall,
		nyckeltal,
		kandidater,
		uppdaterad: uppdaterad || meta.uppdaterad,
		datakalla: 'databas' as const
	};
};

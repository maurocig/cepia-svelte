export const isDuplicatePatientDocumentError = (err: unknown) => {
	const candidates: unknown[] = [err];
	if (err && typeof err === 'object' && 'cause' in err) {
		candidates.push((err as { cause?: unknown }).cause);
	}

	return candidates.some((candidate) => {
		if (!candidate || typeof candidate !== 'object') return false;
		const code = 'code' in candidate ? (candidate as { code?: unknown }).code : undefined;
		const constraint =
			'constraint' in candidate
				? (candidate as { constraint?: unknown }).constraint
				: 'constraint_name' in candidate
					? (candidate as { constraint_name?: unknown }).constraint_name
					: undefined;

		return (
			code === '23505' &&
			typeof constraint === 'string' &&
			constraint.includes('patients_enrolled_id_number_unique')
		);
	});
};

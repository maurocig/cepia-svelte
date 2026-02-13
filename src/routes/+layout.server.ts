export function load({ locals }) {
	// DO DB STUFF HERE, OR CALL AN API, OR WHATEVER YOU WANT TO DO TO GET DATA FOR YOUR LAYOUT
	return {
		user: locals.user
	};
}

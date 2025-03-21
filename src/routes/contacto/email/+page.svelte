<!-- @migration-task Error while migrating Svelte code: `<style>` cannot be a child of `<html>`. `<html>` only allows these children: `<head>`, `<body>`, `<frameset>`. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.
https://svelte.dev/e/node_invalid_placement -->
<html lang="es">
	<body>
		<h1>Mensaje de cepia.uy</h1>
		<p>[nombre] ([email]) te ha enviado un mensaje:</p>
		<p>[mensaje]</p>
	</body>
</html>

<style>
	h1 {
		font-size: 2rem;
	}
</style>

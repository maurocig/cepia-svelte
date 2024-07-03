<script>
	import ContactInfo from './ContactInfo.svelte';
	import LogoHome from './LogoHome.svelte';
	import NavLogo from './NavLogo.svelte';
</script>

<div
	class="mt-10 flex h-[250px] w-full items-center justify-center border border-slate-900/10 bg-slate-200 py-4 shadow-inner"
>
	<div class="grid w-full max-w-[1280px] items-start justify-center md:grid-cols-2">
		<!-- logo -->
		<div class="flex h-full w-full justify-end pr-6">
			<a href="/" class="bor flex h-full w-fit flex-col items-center py-3 text-2xl opacity-80">
				<img
					src="icons/logo-ana.svg"
					alt="logo"
					class=" h-[35px] object-contain object-left drop-shadow-md"
				/>
				<span
					class="font-quicksand text-center font-semibold tracking-wide text-gray-500 drop-shadow-lg"
					>cepia</span
				>
			</a>
		</div>
		<div class="border-l border-gray-800/20 md:pl-6">
			<ContactInfo
				className="text-sm text-gray-500/80"
				data={{
					phone: '092837',
					whatsapp: '23987',
					address: 'Calle 22 y 15, Atlántida, Canelones',
					email: 'ejemplo@gmail.com'
				}}
			/>
		</div>
	</div>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { defaultPatientsTableState, patientsTableState } from '$lib/stores/patients-table';
	import {
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type VisibilityState
	} from '@tanstack/table-core';
	import { ChevronDown } from 'lucide-svelte';
	import { onMount, tick } from 'svelte';
	import { get } from 'svelte/store';
	import type { PatientRow } from './columns';

	let { data, columns }: { data: PatientRow[]; columns: ColumnDef<PatientRow>[] } = $props();
	const persistedState = get(patientsTableState);

	let columnFilters = $state<ColumnFiltersState>([]);
	let filterColumnId = $state(
		persistedState.filterColumnId ?? defaultPatientsTableState.filterColumnId
	);
	let filterValue = $state(persistedState.filterValue ?? defaultPatientsTableState.filterValue);
	let columnVisibility = $state<VisibilityState>(
		persistedState.columnVisibility ?? defaultPatientsTableState.columnVisibility
	);
	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: 10
	});
	let searchField = $state<HTMLDivElement | null>(null);

	function columnLabel(id: string) {
		if (id === 'patientName') return 'Nombre';
		if (id === 'enrolledIdNumber') return 'Documento';
		if (id === 'holderName') return 'Titular';
		if (id === 'statusLabel') return 'Estado';
		if (id === 'admissionModeLabel') return 'Modo de inscripción';
		if (id === 'admissionDate') return 'Fecha de inscripción';
		if (id === 'responsibleAdultName') return 'Adulto responsable';
		if (id === 'attendsSchoolLabel') return 'Asiste a colegio';
		if (id === 'schoolName') return 'Centro educativo';
		return id;
	}

	function getFilterableVisibleColumns() {
		return table.getAllColumns().filter((column) => column.getCanFilter() && column.getIsVisible());
	}

	function applySingleColumnFilter(columnId: string, value: string) {
		columnFilters = value ? [{ id: columnId, value }] : [];
	}

	function persistTableState() {
		patientsTableState.set({
			filterColumnId,
			filterValue,
			columnVisibility
		});
	}

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get pagination() {
				return pagination;
			}
		},
		onColumnFiltersChange: (updater) => {
			columnFilters = updater instanceof Function ? updater(columnFilters) : updater;
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = updater instanceof Function ? updater(columnVisibility) : updater;
			persistTableState();
		},
		onPaginationChange: (updater) => {
			pagination = updater instanceof Function ? updater(pagination) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	});

	$effect(() => {
		const visibleFilterableColumns = getFilterableVisibleColumns();
		if (!visibleFilterableColumns.length) {
			columnFilters = [];
			return;
		}

		const selectedIsVisible = visibleFilterableColumns.some(
			(column) => column.id === filterColumnId
		);
		if (!selectedIsVisible) {
			filterColumnId = visibleFilterableColumns[0].id;
			return;
		}

		applySingleColumnFilter(filterColumnId, filterValue);
		persistTableState();
	});

	onMount(async () => {
		await tick();
		searchField?.querySelector('input')?.focus();
	});
</script>

<div class="space-y-3">
	<div class="relative flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
		<div
			bind:this={searchField}
			class="flex h-11 w-full overflow-hidden rounded-md border border-slate-900/15 bg-white/90 shadow-sm sm:w-auto"
		>
			<Select.Root
				type="single"
				bind:value={filterColumnId}
				onValueChange={() => {
					applySingleColumnFilter(filterColumnId, filterValue);
					persistTableState();
				}}
			>
				<Select.Trigger
					class="mt-px h-11 w-fit items-center justify-between rounded-none border-0 border-r border-slate-900/15 bg-transparent px-3 text-sm shadow-none"
				>
					{columnLabel(filterColumnId)}
				</Select.Trigger>
				<Select.Content>
					{#each getFilterableVisibleColumns() as column (column.id)}
						<Select.Item value={column.id} label={columnLabel(column.id)}>
							{columnLabel(column.id)}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Input
				placeholder={`Filtrar por ${columnLabel(filterColumnId)}...`}
				value={filterValue}
				oninput={(event: any) => {
					filterValue = (event.target as HTMLInputElement).value;
					applySingleColumnFilter(filterColumnId, filterValue);
					persistTableState();
				}}
				class="h-11 w-full min-w-0 rounded-none border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0 sm:w-72 sm:flex-none"
			/>
		</div>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						class="h-11 border-slate-900/15 bg-white/90 px-4 text-slate-700 shadow-sm hover:bg-slate-50"
					>
						Columnas <ChevronDown class="ms-2 size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter((column) => column.getCanHide()) as column (column.id)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					>
						{columnLabel(column.id)}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<div
		class="min-w-0 overflow-hidden rounded-lg border border-slate-900/15 bg-white/90 shadow-md shadow-slate-200/60"
	>
		<div class="max-w-full overflow-x-auto">
			<Table.Root class="min-w-max">
				<Table.Header class="bg-muted/80">
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head class="px-4 py-3.5 text-left font-medium">
									{#if !header.isPlaceholder}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#if table.getRowModel().rows.length}
						{#each table.getRowModel().rows as row (row.id)}
							<Table.Row
								class="hover:bg-muted/30 cursor-pointer border-t transition-colors"
								role="button"
								tabindex={0}
								onclick={() => goto(`/admin/pacientes/${row.original.enrollmentId}`)}
								onkeydown={(event: any) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										void goto(`/admin/pacientes/${row.original.enrollmentId}`);
									}
								}}
							>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell class="px-4 py-3.5">
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					{:else}
						<Table.Row>
							<Table.Cell
								class="text-muted-foreground px-4 py-8 text-center"
								colspan={columns.length}
							>
								No hay resultados.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	<div class="flex items-center justify-end gap-2">
		<Button
			variant="outline"
			size="sm"
			onclick={() => table.previousPage()}
			disabled={!table.getCanPreviousPage()}
		>
			Anterior
		</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={() => table.nextPage()}
			disabled={!table.getCanNextPage()}
		>
			Siguiente
		</Button>
	</div>
</div>

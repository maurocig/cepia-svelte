<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
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
	import type { PatientRow } from './columns';

	let { data, columns }: { data: PatientRow[]; columns: ColumnDef<PatientRow>[] } = $props();

	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({
		responsibleAdultName: false,
		responsibleAdultPhone: false,
		attendsSchoolLabel: false,
		schoolName: false,
		consultationReason: false
	});
	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: 10
	});

	function columnLabel(id: string) {
		if (id === 'patientName') return 'paciente';
		if (id === 'enrolledIdNumber') return 'documento';
		if (id === 'statusLabel') return 'estado';
		if (id === 'admissionDate') return 'fecha inscripción';
		if (id === 'responsibleAdultName') return 'adulto responsable';
		if (id === 'responsibleAdultPhone') return 'tel. responsable';
		if (id === 'attendsSchoolLabel') return 'asiste a colegio';
		if (id === 'schoolName') return 'centro educativo';
		if (id === 'consultationReason') return 'motivo de consulta';
		return id;
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
		},
		onPaginationChange: (updater) => {
			pagination = updater instanceof Function ? updater(pagination) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	});
</script>

<div class="mt-4 space-y-4">
	<div class="relative flex flex-col gap-4 sm:flex-row sm:items-center">
		<Input
			placeholder="Filtrar por Nombre..."
			value={(table.getColumn('patientName')?.getFilterValue() as string) ?? ''}
			oninput={(event: any) =>
				table.getColumn('patientName')?.setFilterValue((event.target as HTMLInputElement).value)}
			class="w-50 shadow-xs sm:max-w-sm"
		/>
		<Input
			placeholder="Filtrar por documento..."
			value={(table.getColumn('enrolledIdNumber')?.getFilterValue() as string) ?? ''}
			oninput={(event: any) =>
				table
					.getColumn('enrolledIdNumber')
					?.setFilterValue((event.target as HTMLInputElement).value)}
			class="w-50 shadow-xs sm:max-w-sm"
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="sm:ms-auto">
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

	<div class="rounded-md border shadow-sm">
		<Table.Root>
			<Table.Header class="bg-muted/40">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="px-3 py-2 text-left font-medium">
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
						<Table.Row class="border-t">
							{#each row.getVisibleCells() as cell (cell.id)}
								<Table.Cell class="px-3 py-2">
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell
							class="text-muted-foreground px-3 py-6 text-center"
							colspan={columns.length}
						>
							No hay resultados.
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
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

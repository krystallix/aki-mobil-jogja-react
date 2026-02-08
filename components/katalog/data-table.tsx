"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Columns2, CirclePlus } from "lucide-react"
import { AddProductDialog } from "./add-product-dialog"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4 gap-2">
                <Input
                    placeholder="Cari produk..."
                    value={(table.getColumn("nama")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("nama")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            <Columns2 /> <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                // Get the header text from column definition
                                const header = column.columnDef.header
                                const headerText = typeof header === 'string'
                                    ? header
                                    : column.id

                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {headerText === "harga_jual" ? "Harga Jual" : headerText}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    variant="default"
                    className="hidden md:flex bg-primary hover:bg-primary/90"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <CirclePlus className="mr-2 h-4 w-4" />
                    Tambah Produk
                </Button>
                <Button
                    variant="default"
                    className="md:hidden bg-primary hover:bg-primary/90"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <CirclePlus className="h-4 w-4" />
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                    {table.getPageCount()} ({table.getFilteredRowModel().rows.length} total baris)
                </div>
                <div className="flex items-center gap-1">
                    {/* First Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">Halaman pertama</span>
                        <ChevronsLeft />
                    </Button>

                    {/* Previous Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">Halaman sebelumnya</span>
                        <ChevronLeft />
                    </Button>

                    {/* Page Numbers */}
                    {(() => {
                        const currentPage = table.getState().pagination.pageIndex
                        const pageCount = table.getPageCount()
                        const pages: (number | string)[] = []

                        if (pageCount <= 7) {
                            // Show all pages if 7 or fewer
                            for (let i = 0; i < pageCount; i++) {
                                pages.push(i)
                            }
                        } else {
                            // Always show first page
                            pages.push(0)

                            if (currentPage <= 3) {
                                // Near the start
                                pages.push(1, 2, 3, 4, "ellipsis", pageCount - 1)
                            } else if (currentPage >= pageCount - 4) {
                                // Near the end
                                pages.push("ellipsis", pageCount - 5, pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1)
                            } else {
                                // In the middle
                                pages.push("ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pageCount - 1)
                            }
                        }

                        return pages.map((page, index) => {
                            if (page === "ellipsis") {
                                return (
                                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                        ...
                                    </span>
                                )
                            }

                            return (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => table.setPageIndex(page as number)}
                                    className="h-8 w-8 p-0"
                                >
                                    {(page as number) + 1}
                                </Button>
                            )
                        })
                    })()}

                    {/* Next Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">Halaman selanjutnya</span>
                        <ChevronRight />

                    </Button>

                    {/* Last Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">Halaman terakhir</span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>

            {/* Add Product Dialog */}
            <AddProductDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    )
}

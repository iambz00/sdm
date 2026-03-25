"use client";

import { Code } from "@/common/types";

import { useState, useCallback, useMemo, useEffect } from "react"
import type { 
  PaginationState, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState, ExpandedState, ColumnPinningState, 
} from "@tanstack/react-table"
import { DataTableRoot } from "@/components/niko-table/core/data-table-root"
import { DataTable } from "@/components/niko-table/core/data-table"
import { DataTableHeader, DataTableBody, DataTableEmptyBody, } from "@/components/niko-table/core/data-table-structure"
import { 
  DataTableAside, DataTableAsideContent, DataTableAsideHeader, DataTableAsideTitle, DataTableAsideDescription, DataTableAsideClose, 
} from "@/components/niko-table/components/data-table-aside"
import { DataTableColumnActions } from "@/components/niko-table/components/data-table-column-actions"
import { DataTableColumnDateFilterOptions } from "@/components/niko-table/components/data-table-column-date-filter-options"
import { DataTableColumnFacetedFilterOptions } from "@/components/niko-table/components/data-table-column-faceted-filter"
import { DataTableColumnHeader } from "@/components/niko-table/components/data-table-column-header"
import { DataTableColumnTitle } from "@/components/niko-table/components/data-table-column-title"
import { DataTableColumnHideOptions } from "@/components/niko-table/components/data-table-column-hide"
import { DataTableColumnPinOptions } from "@/components/niko-table/components/data-table-column-pin"
import { DataTableColumnSliderFilterOptions } from "@/components/niko-table/components/data-table-column-slider-filter-options"
import { DataTableColumnSortOptions } from "@/components/niko-table/components/data-table-column-sort"
import { 
  DataTableEmptyIcon, DataTableEmptyMessage, DataTableEmptyFilteredMessage, DataTableEmptyTitle, DataTableEmptyDescription, DataTableEmptyActions, 
} from "@/components/niko-table/components/data-table-empty-state"
import { DataTablePagination } from "@/components/niko-table/components/data-table-pagination"
import { DataTableSelectionBar } from "@/components/niko-table/components/data-table-selection-bar"
import { SYSTEM_COLUMN_IDS, FILTER_VARIANTS, JOIN_OPERATORS, } from "@/components/niko-table/lib/constants"
import { useDataTable } from "@/components/niko-table/core/data-table-context"
import { daysAgo } from "@/components/niko-table/lib/format"
import { exportTableToCSV } from "@/components/niko-table/filters/table-export-button"
import type { DataTableColumnDef, ExtendedColumnFilter, } from "@/components/niko-table/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchX, UserSearch } from "lucide-react"
import {
  Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Download, Trash2, ChevronRight, ChevronDown, MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { getCurrentFilters, getHandleFiltersChange, FilterParameter, FilterToolbar } from "@/components/niko-table/custom/filter-toolbar"

export default function CodeTable({ codeList }: { codeList: Code[]}) {
  // 하이드레이션 에러 및 서버 사이드 상태 업데이트 방지를 위한 마운트 상태 관리
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [data] = useState<Code[]>(codeList)
  const [globalFilter, setGlobalFilter] = useState<string | object>("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  })

  // Filters
  const codeGroupOptions = useMemo(() => 
    codeList.filter(code => code.group_code === "GROUP").map(code => ({ "label": code.name, "value": code.name})),
    [codeList]
  );

  const FilterParameters: FilterParameter<Code>[] = [
    {
      type: "DataTableFacetedFilter",
      accessorKey: "group_code",
      title: "코드 그룹",
      options: codeGroupOptions,
      multiple: false,
    },
  ]

  // Extract filters for display
  const currentFilters = getCurrentFilters<Code>(globalFilter, columnFilters)

  // Handler for filter menu
  const handleFiltersChange = getHandleFiltersChange<Code>(setColumnFilters, setGlobalFilter)

  // Resolve codes
  const resolveCode = useMemo(() => 
    Object.fromEntries(codeList.map(code => [code.code, code.name])),
    [codeList]
  );

  const columns: DataTableColumnDef<Code>[] = useMemo(
    () => [
      {
        id: SYSTEM_COLUMN_IDS.SELECT,
        size: 40, // Compact width for checkbox column
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "group_code",
        accessorFn: (row: Code) => (resolveCode[row.group_code]),
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle>코드 그룹</DataTableColumnTitle>
            <DataTableColumnActions>
              <DataTableColumnSortOptions />
              <DataTableColumnFacetedFilterOptions
                options={codeGroupOptions}
                multiple={false}
              />
              <DataTableColumnPinOptions />
              <DataTableColumnHideOptions />
            </DataTableColumnActions>
          </DataTableColumnHeader>
        ),
        meta: {
          label: "코드 그룹",
          variant: FILTER_VARIANTS.SELECT,
          options: codeGroupOptions,
        },
        enableColumnFilter: true,
        // cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: "code",
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle>코드</DataTableColumnTitle>
            <DataTableColumnActions>
              <DataTableColumnSortOptions />
              <DataTableColumnPinOptions />
              <DataTableColumnHideOptions />
            </DataTableColumnActions>
          </DataTableColumnHeader>
        ),
        meta: {
          label: "코드",
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "name",
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle>코드명</DataTableColumnTitle>
            <DataTableColumnActions>
              <DataTableColumnSortOptions />
              <DataTableColumnPinOptions />
              <DataTableColumnHideOptions />
            </DataTableColumnActions>
          </DataTableColumnHeader>
        ),
        meta: {
          label: "코드명",
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "description",
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle>설명</DataTableColumnTitle>
          </DataTableColumnHeader>
        ),
        meta: {
          label: "설명",
        },
        enableColumnFilter: true,
      },
    ]
  , [])

  // 마운트되기 전(서버 렌더링 중)에는 데이터 테이블을 렌더링하지 않고 스켈레톤이나 빈 화면을 보여줍니다.
  if (!isMounted) {
    return (
      <div className="w-full space-y-4">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-150 w-full animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <DataTableRoot
        data={data}
        columns={columns}
        config={{
          enableSorting: true,
          enableMultiSort: true,
          enableFilters: true,
          enableRowSelection: true,
        }}
        getRowCanExpand={() => true}
        getSubRows={() => undefined}
        state={{
          globalFilter,
          sorting,
          columnFilters,
          columnVisibility,
          rowSelection,
          columnPinning,
        }}
        onGlobalFilterChange={value => {
          setGlobalFilter(value)
        }}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        onColumnVisibilityChange={setColumnVisibility}
        onRowSelectionChange={setRowSelection}
        onColumnPinningChange={setColumnPinning}
      >
        <FilterToolbar
          filters={currentFilters}
          onFiltersChange={handleFiltersChange}
          FilterParameters={FilterParameters}
        />

        <DataTable className="flex-1" height="100%">
          <DataTableHeader />
          <DataTableBody
            onRowClick={(code: Code) => {
              console.log("Row clicked:", code.code)
            }}
          >
            <DataTableEmptyBody>
              <DataTableEmptyMessage>
                <DataTableEmptyIcon>
                  <UserSearch className="size-12" />
                </DataTableEmptyIcon>
                <DataTableEmptyTitle>No products found</DataTableEmptyTitle>
                <DataTableEmptyDescription>
                  Get started by adding your first product to the inventory.
                </DataTableEmptyDescription>
              </DataTableEmptyMessage>
              <DataTableEmptyFilteredMessage>
                <DataTableEmptyIcon>
                  <SearchX className="size-12" />
                </DataTableEmptyIcon>
                <DataTableEmptyTitle>No matches found</DataTableEmptyTitle>
                <DataTableEmptyDescription>
                  Try adjusting your filters or search to find what
                  you&apos;re looking for.
                </DataTableEmptyDescription>
              </DataTableEmptyFilteredMessage>
              <DataTableEmptyActions>
                <Button onClick={() => alert("Add product clicked")}>
                  Add Product
                </Button>
              </DataTableEmptyActions>
            </DataTableEmptyBody>
          </DataTableBody>
        </DataTable>
      </DataTableRoot>
    </div>
  )
}

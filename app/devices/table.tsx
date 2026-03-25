"use client";

import { Device, Code, Organization } from "@/common/types";
import { cn } from "@/lib/utils"
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
import { DataTableColumnSortMenu } from "@/components/niko-table/components/data-table-column-sort"
import { DataTableColumnFacetedFilterMenu } from "@/components/niko-table/components/data-table-column-faceted-filter"

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

const STATUS_COLOR_CLASSNAME = {
  "STS_NORMAL"  : "border-green-500",
  "STS_BROKEN"  : "border-amber-500",
  "STS_LOST"    : "border-red-500",
  "STS_ETC"     : "border-yellow-300",
  "STS_DISPOSED": "border-gray-500",
  "STS_MISSING" : "border-red-500", // LOST 로 수정
  "STS_REPAIR"  : "border-yellow-300",  // 삭제
}

// Expanded row content component
function ExpandedRowContent({ device }: { device: Device }) {
  return (
    <div className="bg-muted/30 p-4">
      <div className="space-y-3">
        <div>
          <h4 className="mb-2 text-sm font-semibold">최종 수정</h4>
          <p className="text-sm text-muted-foreground">
            {new Date(device.updated_at).toLocaleString()}
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">부가 정보</h4>
            {Object.entries(device.metadata).map(([key, value]) => (
              <div key={key}>
                {key}: {value}
              </div>
            ))}
          <div className="flex flex-wrap gap-2">
          </div>
        </div>
      </div>
    </div>
  )
}

// Product details component for sidebar
function DeviceDetails({ device }: { device: Device }) {
  if (!device) return null

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold">{device.asset_number}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {'label'}
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand:</span>
                <span>
                  
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">{device.serial_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock:</span>
                <span>
                  {device.mac_address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating:</span>
                <div className="flex items-center gap-1">
                  <span>{JSON.stringify(device.metadata)}</span>
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="default">
                  test
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Release Date:</span>
                <span>{device.updated_at.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">
              {device.organization_code}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

// Bulk actions component
function BulkActions() {
  const { table } = useDataTable<Device>()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleBulkExport = () => {
    exportTableToCSV(table, {
      filename: "selected-products",
      excludeColumns: [
        "select",
        "expand",
        "actions",
      ] as unknown as (keyof Device)[],
      onlySelected: true,
    })
  }

  const handleBulkDelete = () => {
    // In a real app, you would delete the selected items
    console.log(
      "Deleting:",
      selectedRows.map(row => row.original.id),
    )
    table.resetRowSelection()
  }

  return (
    <DataTableSelectionBar
      selectedCount={selectedCount}
      onClear={() => table.resetRowSelection()}
    >
      <Button size="sm" variant="outline" onClick={handleBulkExport}>
        <Download className="mr-2 h-4 w-4" />
        Export Selected
      </Button>
      <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Selected
      </Button>
    </DataTableSelectionBar>
  )
}


export default function DeviceTable({
  codeList,
  deviceList,
  orgList
}: {
  codeList: Code[],
  deviceList: Device[],
  orgList: Organization[]
}) {
  // 하이드레이션 에러 및 서버 사이드 상태 업데이트 방지를 위한 마운트 상태 관리
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Controlled state management
  const [data] = useState<Device[]>(deviceList)
  const [globalFilter, setGlobalFilter] = useState<string | object>("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  })

  // Sidebar state
  const [selectedDevice, setSelectedDevice] =  useState<Device | null>(null)

  // Filters
  let usageGroupOptions
  usageGroupOptions = [
    { label: "1학년 1반", value: "1" },
    { label: "컴퓨터실", value: "2" },
    { label: "3학년 2반", value: "3" },
    { label: "도서관 대여", value: "4" },
  ]

  const statusGroupOptions = useMemo(() => 
    codeList.filter(code => code.group_code === "GRP_STATUS").map(code => ({ "label": code.name, "value": code.code})),
    [codeList]
  )

  const FilterParameters: FilterParameter<Device>[] = [
    {
      type: "DataTableFacetedFilter",
      accessorKey: "usage_group_id",
      title: "용도구분",
      options: usageGroupOptions,
      multiple: true,
    },
    {
      type: "DataTableFacetedFilter",
      accessorKey: "status_code",
      title: "상태",
      options: statusGroupOptions,
      multiple: true,
    }
  ]

  // Extract filters for display
  const currentFilters = getCurrentFilters<Device>(globalFilter, columnFilters)

  // Handler for filter menu
  const handleFiltersChange = getHandleFiltersChange<Device>(setColumnFilters, setGlobalFilter, setPagination)

  // Resolve codes
  const resolveCode = useMemo(() => 
    Object.fromEntries(codeList.map(code => [code.code, code.name])),
    [codeList]
  );
  // Resolve organizations
  const resolveOrg = useMemo(() => 
    Object.fromEntries(orgList.map(org => [org.code, org.name])),
    [orgList]
  );

  // Define columns with all features
  const columns: DataTableColumnDef<Device>[] = useMemo(
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
        id: SYSTEM_COLUMN_IDS.EXPAND,
        header: () => null,
        cell: ({ row }) => {
          if (!row.getCanExpand()) return null
          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={row.getToggleExpandedHandler()}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )
        },
        size: 50,
        enableSorting: false,
        enableHiding: false,
        meta: {
          expandedContent: (device: Device) => (
            <ExpandedRowContent device={device} />
          ),
        },
      },
      {
        accessorKey: "organization_code",
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle>조직</DataTableColumnTitle>
            <DataTableColumnActions isActive label="Options">
              {/* <DataTableColumnSortOptions withSeparator={false} /> */}
              <DataTableColumnSortOptions />
              <DataTableColumnPinOptions />
              <DataTableColumnHideOptions />
            </DataTableColumnActions>
          </DataTableColumnHeader>
        ),
        meta: {
          label: "조직",
          variant: FILTER_VARIANTS.TEXT,
        },
        enableColumnFilter: true,
        accessorFn: (row: Device) => resolveOrg[row.organization_code],
      },
      {
        accessorKey: "usage_group_id",
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle />
            <DataTableColumnActions isActive label="Options">
              <DataTableColumnSortOptions
                variant={FILTER_VARIANTS.TEXT}
              />
              <DataTableColumnFacetedFilterOptions
                options={usageGroupOptions}
                multiple
              />
              <DataTableColumnPinOptions />
              <DataTableColumnHideOptions />
            </DataTableColumnActions>
          </DataTableColumnHeader>
        ),
        meta: {
          label: "용도구분",
          variant: FILTER_VARIANTS.SELECT,
          options: usageGroupOptions,
        },
        cell: ({ row }) => {
          const usageGroup = row.getValue("usage_group_id") as string
          const option = usageGroupOptions.find(opt => opt.value == usageGroup)
          return <span>{option?.label || usageGroup}</span>
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "asset_number",
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle>관리번호</DataTableColumnTitle>
            <DataTableColumnActions isActive label="Options">
              <DataTableColumnSortOptions />
              <DataTableColumnPinOptions />
              <DataTableColumnHideOptions />
            </DataTableColumnActions>
          </DataTableColumnHeader>
        ),
        meta: {
          label: "관리번호",
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "status_code",
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle />
            {/* Composable Actions: Multi-select filter example */}
            <DataTableColumnActions isActive label="Options">
              <DataTableColumnSortOptions
                variant={FILTER_VARIANTS.TEXT}
                withSeparator={false}
              />
              <DataTableColumnFacetedFilterOptions
                options={statusGroupOptions}
                multiple
              />
              <DataTableColumnPinOptions />
              <DataTableColumnHideOptions />
            </DataTableColumnActions>
          </DataTableColumnHeader>
        ),
        meta: {
          label: "상태",
          variant: FILTER_VARIANTS.SELECT,
          options: statusGroupOptions,
        },
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={STATUS_COLOR_CLASSNAME[row.original.status_code as keyof typeof STATUS_COLOR_CLASSNAME]}
          >
            {resolveCode[row.getValue("status_code") as string]}
          </Badge>
        ),
        enableColumnFilter: true,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const device = row.original
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedDevice(device)
                    }}
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log("Edit", device.id)}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log("Delete", device.id)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  )

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
          enablePagination: true,
          enableSorting: true,
          enableMultiSort: true,
          enableFilters: true,
          enableRowSelection: true,
          enableExpanding: true,
        }}
        getRowCanExpand={() => true}
        getSubRows={() => undefined}
        state={{
          globalFilter,
          sorting,
          columnFilters,
          columnVisibility,
          rowSelection,
          expanded,
          columnPinning,
          pagination,
        }}
        onGlobalFilterChange={value => {
          setGlobalFilter(value)
          setPagination(prev => ({ ...prev, pageIndex: 0 }))
        }}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        onColumnVisibilityChange={setColumnVisibility}
        onRowSelectionChange={setRowSelection}
        onExpandedChange={setExpanded}
        onColumnPinningChange={setColumnPinning}
        onPaginationChange={setPagination}
      >
        <FilterToolbar
          filters={currentFilters}
          onFiltersChange={handleFiltersChange}
          FilterParameters={FilterParameters}
        />
        <BulkActions />

        {/* Sidebar Layout */}
        <div className="flex min-h-150 gap-4">
          {/* Main Table Area */}
          <DataTable className="flex-1" height="100%">
            <DataTableHeader />
            <DataTableBody
              onRowClick={(device: Device) => {
                selectedDevice? setSelectedDevice(null) : setSelectedDevice(device)
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

          {/* Right Sidebar - Product Details */}
          {selectedDevice && (
            <DataTableAside
              side="right"
              open={!!selectedDevice}
              onOpenChange={open => {
                if (!open) setSelectedDevice(null)
              }}
            >
              <DataTableAsideContent width="w-1/3 min-w-80">
                <DataTableAsideHeader>
                  <DataTableAsideTitle>Product Details</DataTableAsideTitle>
                  <DataTableAsideDescription>
                    View detailed information
                  </DataTableAsideDescription>
                  <DataTableAsideClose />
                </DataTableAsideHeader>
                <DeviceDetails device={selectedDevice} />
              </DataTableAsideContent>
            </DataTableAside>
          )}
        </div>
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}
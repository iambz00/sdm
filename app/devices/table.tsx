"use client"

import { Device } from "@/common/type/device";
import { Code } from "@/common/type/code";
import { Organization } from "@/common/type/organization";

import { useState, useCallback, useMemo, useEffect } from "react"
import type {
  PaginationState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ExpandedState,
  ColumnPinningState,
} from "@tanstack/react-table"
import { DataTableRoot } from "@/components/niko-table/core/data-table-root"
import { DataTable } from "@/components/niko-table/core/data-table"
import {
  DataTableHeader,
  DataTableBody,
  DataTableEmptyBody,
} from "@/components/niko-table/core/data-table-structure"
import {
  DataTableAside,
  DataTableAsideContent,
  DataTableAsideHeader,
  DataTableAsideTitle,
  DataTableAsideDescription,
  DataTableAsideClose,
} from "@/components/niko-table/components/data-table-aside"
import { DataTableClearFilter } from "@/components/niko-table/components/data-table-clear-filter"
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
  DataTableEmptyIcon,
  DataTableEmptyMessage,
  DataTableEmptyFilteredMessage,
  DataTableEmptyTitle,
  DataTableEmptyDescription,
  DataTableEmptyActions,
} from "@/components/niko-table/components/data-table-empty-state"
import { DataTableFacetedFilter, DataTableFacetedFilterContent } from "@/components/niko-table/components/data-table-faceted-filter"
import { DataTableFilterMenu } from "@/components/niko-table/components/data-table-filter-menu"
import { DataTablePagination } from "@/components/niko-table/components/data-table-pagination"
import { DataTableSearchFilter } from "@/components/niko-table/components/data-table-search-filter"
import { DataTableSelectionBar } from "@/components/niko-table/components/data-table-selection-bar"
import { DataTableSliderFilter } from "@/components/niko-table/components/data-table-slider-filter"
import { DataTableSortMenu } from "@/components/niko-table/components/data-table-sort-menu"
import { DataTableToolbarSection } from "@/components/niko-table/components/data-table-toolbar-section"
import { DataTableViewMenu } from "@/components/niko-table/components/data-table-view-menu"
import {
  SYSTEM_COLUMN_IDS,
  FILTER_VARIANTS,
  JOIN_OPERATORS,
} from "@/components/niko-table/lib/constants"
import { useDataTable } from "@/components/niko-table/core/data-table-context"
import { daysAgo } from "@/components/niko-table/lib/format"
import { exportTableToCSV } from "@/components/niko-table/filters/table-export-button"
import type {
  DataTableColumnDef,
  ExtendedColumnFilter,
} from "@/components/niko-table/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchX, UserSearch } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Trash2,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { access } from "node:fs";

const categoryOptions = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothing", value: "clothing" },
  { label: "Home & Garden", value: "home-garden" },
  { label: "Sports", value: "sports" },
  { label: "Books", value: "books" },
]
const brandOptions = [
  { label: "Apple", value: "apple" },
  { label: "Samsung", value: "samsung" },
  { label: "Nike", value: "nike" },
  { label: "Adidas", value: "adidas" },
  { label: "Sony", value: "sony" },
  { label: "LG", value: "lg" },
  { label: "Dell", value: "dell" },
  { label: "HP", value: "hp" },
]

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

interface FilterParameter {
  type: string;
  accessorKey: keyof Device;
  title: string;
  options: any[];
  multiple?: boolean;
  limitToFilteredRows?: boolean;
}

// Filter toolbar component
function FilterToolbar({
  filters,
  onFiltersChange,
  FilterParameters
}: {
  filters: ExtendedColumnFilter<Device>[]
  onFiltersChange: (filters: ExtendedColumnFilter<Device>[] | null) => void
  FilterParameters: FilterParameter[]
}) {
  return (
    <DataTableToolbarSection className="w-full flex-col justify-between gap-2">
      <DataTableToolbarSection className="px-0">
        <DataTableViewMenu />
        {FilterParameters.map(parameter => {
          switch(parameter.type) {
            case "DataTableFacetedFilter":
              return (
                <DataTableFacetedFilter
                  key={parameter.accessorKey}
                  accessorKey={parameter.accessorKey}
                  title={parameter.title}
                  options={parameter.options}
                  multiple
                />
              )
            case "DataTableSliderFilter":
              return (
                <></>
              )
            case "DataTableDateFilter":
              return (
                <></>
              )
          }
        })}
        <DataTableSortMenu />
        <DataTableFilterMenu
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
        <DataTableClearFilter />
        <DataTableSearchFilter placeholder="Search products..." className="w-1/2"/>
      </DataTableToolbarSection>
    </DataTableToolbarSection>
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

  const resetAllState = useCallback(() => {
    setGlobalFilter("")
    setSorting([])
    setColumnFilters([])
    setColumnVisibility({})
    setRowSelection({})
    setExpanded({})
    setColumnPinning({ left: [], right: [] })
    setPagination({ pageIndex: 0, pageSize: 10 })
    setSelectedDevice(null)
  }, [])

  // Filters
  let usageGroupOptions
  usageGroupOptions = [
    { label: "1학년 1반", value: "1" },
    { label: "컴퓨터실", value: "2" },
    { label: "3학년 2반", value: "3" },
    { label: "도서관 대여", value: "4" },
  ]

  const statusGroupOptions = [
    
  ]

  const FilterParameters:FilterParameter[] = [
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
      options: categoryOptions,
      multiple: true,
    }
  ]

  // Extract filters for display
  const currentFilters = useMemo(() => {
    if (
      typeof globalFilter === "object" &&
      globalFilter &&
      "filters" in globalFilter
    ) {
      const filterObj = globalFilter as {
        filters: ExtendedColumnFilter<Device>[]
      }
      return filterObj.filters || []
    }
    return columnFilters
      .map(cf => cf.value)
      .filter(
        (v): v is ExtendedColumnFilter<Device> =>
          v !== null && typeof v === "object" && "id" in v,
      )
  }, [globalFilter, columnFilters])

  // Handler for filter menu
  const handleFiltersChange = useCallback(
    (filters: ExtendedColumnFilter<Device>[] | null) => {
      if (!filters || filters.length === 0) {
        setColumnFilters([])
        setGlobalFilter("")
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
      } else {
        const hasOrFilters = filters.some(
          (filter, index) => index > 0 && filter.joinOperator === "or",
        )
        if (hasOrFilters) {
          setColumnFilters([])
          setGlobalFilter({
            filters,
            joinOperator: "mixed",
          })
          setPagination(prev => ({ ...prev, pageIndex: 0 }))
        } else {
          setGlobalFilter("")
          setColumnFilters(
            filters.map(filter => ({
              id: filter.id,
              value: filter,
            })),
          )
          setPagination(prev => ({ ...prev, pageIndex: 0 }))
        }
      }
    },
    [],
  )

  // Helper to display global filter state
  const getGlobalFilterDisplay = () => {
    if (typeof globalFilter === "string") {
      return globalFilter || "None"
    }
    if (
      typeof globalFilter === "object" &&
      globalFilter &&
      "filters" in globalFilter
    ) {
      const filterObj = globalFilter as {
        filters: unknown[]
        joinOperator: string
      }
      return `OR Filter (${filterObj.filters?.length || 0} conditions)`
    }
    return "None"
  }

  // Extract actual filter data for display
  const displayFilters = useMemo(() => {
    if (
      typeof globalFilter === "object" &&
      globalFilter &&
      "filters" in globalFilter
    ) {
      const filterObj = globalFilter as {
        filters: unknown[]
        joinOperator: string
      }
      return filterObj.filters || []
    }
    return columnFilters
  }, [columnFilters, globalFilter])

  // Enhanced filter statistics
  const filterStats = useMemo(() => {
    if (
      typeof globalFilter === "object" &&
      globalFilter &&
      "filters" in globalFilter
    ) {
      const filterObj = globalFilter as {
        filters: Array<{
          joinOperator?: string
          value?: unknown
        }>
        joinOperator: string
      }
      const filters = filterObj.filters || []

      const hasAndFilters = filters.some(
        (filter, index) =>
          index === 0 || filter.joinOperator === JOIN_OPERATORS.AND,
      )
      const hasOrFilters = filters.some(
        (filter, index) =>
          index > 0 && filter.joinOperator === JOIN_OPERATORS.OR,
      )

      return {
        totalFilters: filters.length,
        hasAndFilters,
        hasOrFilters,
        effectiveJoinOperator: hasOrFilters
          ? JOIN_OPERATORS.MIXED
          : JOIN_OPERATORS.AND,
        activeFilters: filters.filter(f => f.value && f.value !== "").length,
      }
    }

    const hasAndFilters = columnFilters.length > 0
    const hasOrFilters = columnFilters.some(
      filter =>
        typeof filter.value === "object" &&
        filter.value &&
        "joinOperator" in filter.value &&
        filter.value.joinOperator === "or",
    )

    return {
      totalFilters: columnFilters.length,
      hasAndFilters,
      hasOrFilters,
      effectiveJoinOperator: hasOrFilters
        ? JOIN_OPERATORS.MIXED
        : JOIN_OPERATORS.AND,
      activeFilters: columnFilters.filter(f => f.value && f.value !== "")
        .length,
    }
  }, [columnFilters, globalFilter])

  // Get current filter mode
  const getFilterMode = () => {
    if (
      typeof globalFilter === "object" &&
      globalFilter &&
      "filters" in globalFilter
    ) {
      const filterObj = globalFilter as {
        filters: unknown[]
        joinOperator: string
      }
      if (filterObj.joinOperator === "mixed") {
        return "MIXED"
      }
      return filterObj.joinOperator.toUpperCase()
    }

    const hasOrOperators = columnFilters.some(
      filter =>
        typeof filter.value === "object" &&
        filter.value &&
        "joinOperator" in filter.value &&
        filter.value.joinOperator === "or",
    )

    return hasOrOperators ? "MIXED" : "AND"
  }

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
            <DataTableColumnActions>
              <DataTableColumnSortOptions withSeparator={false} />
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
        accessorFn: (row: Device) => (orgList?.find(org => org.code === row.organization_code)?.name),
      },
      {
        accessorKey: "usage_group_id",
        header: () => (
          <DataTableColumnHeader>
            <DataTableColumnTitle />
            {/* Composable Actions: Multi-select filter example */}
            <DataTableColumnActions label="Category Options">
              <DataTableColumnSortOptions
                variant={FILTER_VARIANTS.TEXT}
                withSeparator={false}
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
          const usageGroup = row.getValue("usage_group_id") as String
          const option = usageGroupOptions.find(opt => opt.value === usageGroup)
          return <span>{option?.label || usageGroup}</span>
        },
        enableColumnFilter: true,
      },
      {
        accessorKey: "asset_number",
        header: () => (
          <DataTableColumnHeader className="justify-start">
            <DataTableColumnTitle>관리번호</DataTableColumnTitle>
            <DataTableColumnActions>
              <DataTableColumnSortOptions withSeparator={false} />
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
          <DataTableColumnHeader>
            <DataTableColumnTitle />
            {/* Composable Actions: Multi-select filter example */}
            <DataTableColumnActions label="Category Options">
              <DataTableColumnSortOptions
                variant={FILTER_VARIANTS.TEXT}
                withSeparator={false}
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
          label: "상태",
          variant: FILTER_VARIANTS.SELECT,
          // options: categoryOptions,
        },
        cell: ({ row }) => {
          const inStock = true
          return (
            <Badge variant={inStock ? "default" : "secondary"}>
              {inStock ? "Yes" : "No"}
            </Badge>
          )
        },
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
        <div className="h-[600px] w-full animate-pulse rounded bg-muted" />
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
                console.log("Row clicked:", device.id)
                setSelectedDevice(device)
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
              <DataTableAsideContent width="w-78">
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

      {/* State Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Table State</CardTitle>
          <CardDescription>
            Live view of all table state for demonstration
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={resetAllState}>
              Reset All State
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-medium">Search Query:</span>
              <span className="text-foreground">
                {getGlobalFilterDisplay()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Total Items:</span>
              <span className="text-foreground">{data.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Selected Rows:</span>
              <span className="text-foreground">
                {
                  Object.keys(rowSelection).filter(key => rowSelection[key])
                    .length
                }
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Expanded Rows:</span>
              <span className="text-foreground">
                {typeof expanded === "object" && expanded !== null
                  ? Object.keys(expanded).filter(
                      key => (expanded as Record<string, boolean>)[key],
                    ).length
                  : 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Active Filters:</span>
              <span className="text-foreground">{columnFilters.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Enhanced Filters:</span>
              <span className="text-foreground">
                {filterStats.totalFilters}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Active Enhanced:</span>
              <span className="text-foreground">
                {filterStats.activeFilters}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Join Logic:</span>
              <span className="text-foreground">
                {filterStats.effectiveJoinOperator}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Sorting:</span>
              <span className="text-foreground">
                {sorting.length > 0
                  ? sorting
                      .map(s => `${s.id} ${s.desc ? "desc" : "asc"}`)
                      .join(", ")
                  : "None"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Page:</span>
              <span className="text-foreground">
                {pagination.pageIndex + 1} (Size: {pagination.pageSize})
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Hidden Columns:</span>
              <span className="text-foreground">
                {
                  Object.values(columnVisibility).filter(v => v === false)
                    .length
                }
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Pinned Columns:</span>
              <span className="text-foreground">
                {columnPinning.left?.length || 0} Left,{" "}
                {columnPinning.right?.length || 0} Right
              </span>
            </div>
          </div>

          {/* Detailed state (collapsible) */}
          <details className="border-t pt-4">
            <summary className="cursor-pointer text-xs font-medium hover:text-foreground">
              View Full State Object
            </summary>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <strong>Enhanced Filters:</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {displayFilters.length > 0
                    ? JSON.stringify(displayFilters, null, 2)
                    : "No enhanced filters"}
                </pre>
              </div>
              <div>
                <strong>Column Pinning:</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {JSON.stringify(columnPinning, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Filter Stats:</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {JSON.stringify(filterStats, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Filter Mode:</strong> {getFilterMode()}
                <div className="mt-1 text-muted-foreground">
                  {getFilterMode() === "AND"
                    ? "All conditions must match (stored in columnFilters)"
                    : getFilterMode() === "OR"
                      ? "Any condition can match (stored in globalFilter)"
                      : "Mixed logic - individual AND/OR operators per filter"}
                </div>
              </div>
              <div>
                <strong>Sorting:</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {JSON.stringify(sorting, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Column Filters State (AND logic):</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {JSON.stringify(columnFilters, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Global Filter State (OR logic):</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {JSON.stringify(globalFilter, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Column Visibility:</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {JSON.stringify(columnVisibility, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Row Selection:</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {JSON.stringify(rowSelection, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Expanded Rows:</strong>
                <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                  {JSON.stringify(expanded, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}
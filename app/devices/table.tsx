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
import { SearchX, UserSearch, Info } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DownloadIcon, CaretDownIcon, CaretRightIcon, TrashIcon, PencilSimpleIcon, DotsThreeOutlineIcon } from "@phosphor-icons/react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { getCurrentFilters, getHandleFiltersChange, FilterParameter, FilterToolbar } from "@/components/niko-table/custom/filter-toolbar"
import {  } from "@phosphor-icons/react"

const STATUS_COLOR_CLASSNAME = {
  "STS_NORMAL"  : "border-green-500",
  "STS_BROKEN"  : "border-amber-500",
  "STS_LOST"    : "border-red-500",
  "STS_ETC"     : "border-yellow-300",
  "STS_DISPOSED": "border-gray-500",
  "STS_MISSING" : "border-red-500", // LOST 로 수정
  "STS_REPAIR"  : "border-yellow-300",  // 삭제
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour12: false,
  hour: "numeric",
  minute: "numeric",
  timeZone: "Asia/Seoul",
})

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
function DeviceDetails({
  device,
  resolver,
}: {
  device: Device,
  resolver: Record<string, Record<string, string>>,
}) {
  if (!device) return null

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-2xl font-bold">
            {device.asset_number}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            label
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold">기기 상태</h3>
            <div className="space-y-2 text-sm pl-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">조직:</span>
                <span className="">{resolver.org[device.organization_code] || device.organization_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">용도:</span>
                <span className="">{resolver.usageGroup[device.usage_group_id] || device.usage_group_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">상태:</span>
                <span className="">{resolver.code[device.status_code] || device.status_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">부가 정보:</span>
                <div className="flex items-center gap-1">
                  <span>{JSON.stringify(device.metadata)}</span>
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold">세부 정보</h3>
            <div className="space-y-2 text-sm pl-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">S/N:</span>
                <span>
                  {device.serial_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">WiFi MAC:</span>
                <span>
                  {device.mac_address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">모델명:</span>
                <span>
                  {device.model_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">도입 차수:</span>
                <span>
                  {device.distribution_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">등록일:</span>
                <span>
                  {DATE_TIME_FORMATTER.format(new Date(device.created_at))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">최종 수정자:</span>
                <span>
                  {device.updated_by || "관리자"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">최종 수정:</span>
                <span>
                  {DATE_TIME_FORMATTER.format(new Date(device.updated_at))}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold">도입 정보</h3>
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

interface AlertType {
  id: number;
  payload: string;
}

interface TimedAlertProps {
  id: number;
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  timer?: number;
  onClose: (id: number) => void;
}

const TimedAlert = ({ id, icon, title, description, timer = 5000, onClose }: TimedAlertProps) => {
  useEffect(() => {
    if (timer <= 0) return;
    const timeout = setTimeout(() => onClose(id), timer);
    return () => clearTimeout(timeout);
  }, [id, timer, onClose]);

  return (
    <Alert
      className="w-full max-w-lg pointer-events-auto flex flex-col items-start gap-2 border-primary/50 bg-background/95 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-top-5"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <AlertTitle className="m-0 font-bold text-primary">{title}</AlertTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onClose(id)}
          className="h-auto p-1 text-muted-foreground hover:text-foreground"
        >
          닫기
        </Button>
      </div>
      <AlertDescription className="w-full text-sm">
        {description}
      </AlertDescription>
    </Alert>
  );
};

// Bulk actions component
function BulkActions() {
  const { table } = useDataTable<Device>()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length
  const [alerts, setAlerts] = useState<AlertType[]>([])

  const handleBulkEdit = () => {
    console.log(
      "Listing:",
      selectedRows.map(row => row.original.id),
    )
    table.resetRowSelection()
  }

  const handleBulkTest = () => {
    const id = Date.now()
    const newAlert = {
      id,
      payload: selectedRows.map(row => row.original.id).toString(),
    }
    setAlerts((prev) => {
      const next = [...prev, newAlert]
      return next.length > 5 ? next.slice(1) : next
    })

    // 5초 후 자동으로 해당 알림 삭제
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    }, 5000)
  }

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
    <>
      <div className="fixed inset-x-0 top-8 z-50 flex flex-col items-center gap-3 px-4 pointer-events-none">
        {alerts.map((alert) => (
          <TimedAlert
            key={alert.id}
            id={alert.id}
            icon={<Info className="h-4 w-4 text-primary" />}
            title={`테스트 결과 (${alert.payload.length}건)`}
            timer={5000}
            onClose={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
            description={
              <div className="flex flex-wrap gap-2 pt-2">
                {alert.payload}
              </div>
            }
          />
        ))}
      </div>
      <DataTableSelectionBar
        selectedCount={selectedCount}
        onClear={() => table.resetRowSelection()}
      >
        <Button size="sm" variant="outline" onClick={handleBulkEdit}>
          <PencilSimpleIcon className="mr-1 h-4 w-4" />
          선택 수정
        </Button>
        <Button size="sm" variant="outline" onClick={handleBulkTest}>
          테스트
        </Button>
        <Button size="sm" variant="outline" onClick={handleBulkExport}>
          <DownloadIcon className="mr-1 h-4 w-4" />
          엑셀 다운
        </Button>
        <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
          <TrashIcon className="mr-1 h-4 w-4" />
          Delete Selected
        </Button>
      </DataTableSelectionBar>
    </>
  )
}


export default function DeviceTable({
  watchList,
  watchObject
}: {
  watchList: string[],  // FetchType[]
  watchObject: Record<string, any>
}) {
  // 하이드레이션 에러 및 서버 사이드 상태 업데이트 방지를 위한 마운트 상태 관리
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Controlled state management
  const [data] = useState<Device[]>(watchObject.device)
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
    watchObject.code.filter(code => code.group_code === "GRP_STATUS").map(code => ({ "label": code.name, "value": code.code})),
    [watchObject.code]
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

  // Resolve id to name
  // const resolver2 = useMemo(() => ({
  //     code : Object.fromEntries(watchObject.code.map(code => [code.code, code.name])),
  //     org  : Object.fromEntries(watchObject.org.map(org => [org.code, org.name])),
  //     usageGroup  : Object.fromEntries(watchObject.usageGroup.map(usageGroup => [usageGroup.id, usageGroup.name])),
  //     distribution  : Object.fromEntries(watchObject.distribution.map(distribution => [distribution.id, distribution.name])),
  //     distributionInfo  : Object.fromEntries(watchObject.distributionInfo.map(distributionInfo => [distributionInfo.id, distributionInfo.name])),
  //   }),
  //   [watchObject.code, watchObject.org]
  // )

  const resolvr = watchList.map(
    key => [key, Object.fromEntries(watchObject[key].map(subkey => [subkey.code || subkey.id, subkey.name]))]
  )

  const resolver = Object.fromEntries(resolvr)

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
                <CaretDownIcon className="h-4 w-4" />
              ) : (
                <CaretRightIcon className="h-4 w-4" />
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
        accessorFn: (row: Device) => resolver.org[row.organization_code],
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
            {resolver.code[row.getValue("status_code") as string]}
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
                    <DotsThreeOutlineIcon className="h-4 w-4" />
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
                (selectedDevice === device)? setSelectedDevice(null) : setSelectedDevice(device)
              }}
            >
              <DataTableEmptyBody>
                <DataTableEmptyMessage>
                  <DataTableEmptyIcon>
                    <UserSearch className="size-12" />
                  </DataTableEmptyIcon>
                  <DataTableEmptyTitle> </DataTableEmptyTitle>
                  <DataTableEmptyDescription> </DataTableEmptyDescription>
                </DataTableEmptyMessage>
                <DataTableEmptyFilteredMessage>
                  <DataTableEmptyIcon>
                    <SearchX className="size-12" />
                  </DataTableEmptyIcon>
                  <DataTableEmptyTitle>No matches found</DataTableEmptyTitle>
                  <DataTableEmptyDescription> </DataTableEmptyDescription>
                </DataTableEmptyFilteredMessage>
                <DataTableEmptyActions> </DataTableEmptyActions>
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
                  <DataTableAsideTitle>기기 정보</DataTableAsideTitle>
                  <DataTableAsideDescription>
                    {/* View detailed information */}
                  </DataTableAsideDescription>
                  {/* <DataTableAsideClose /> */}
                </DataTableAsideHeader>
                <DeviceDetails device={selectedDevice} resolver={resolver} />
              </DataTableAsideContent>
            </DataTableAside>
          )}
        </div>
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}
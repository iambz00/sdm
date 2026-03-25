import { useMemo, useCallback, SetStateAction } from "react"
import { DataTableClearFilter } from "@/components/niko-table/components/data-table-clear-filter"
import { DataTableFacetedFilter, DataTableFacetedFilterContent } from "@/components/niko-table/components/data-table-faceted-filter"
import { DataTableFilterMenu } from "@/components/niko-table/components/data-table-filter-menu"
import { DataTableSearchFilter } from "@/components/niko-table/components/data-table-search-filter"
import { DataTableSelectionBar } from "@/components/niko-table/components/data-table-selection-bar"
import { DataTableSliderFilter } from "@/components/niko-table/components/data-table-slider-filter"
import { DataTableSortMenu } from "@/components/niko-table/components/data-table-sort-menu"
import { DataTableToolbarSection } from "@/components/niko-table/components/data-table-toolbar-section"
import { DataTableViewMenu } from "@/components/niko-table/components/data-table-view-menu"
import type {
  DataTableColumnDef,
  ExtendedColumnFilter,
} from "@/components/niko-table/types"
import type { 
  PaginationState, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState, ExpandedState, ColumnPinningState, 
} from "@tanstack/react-table"
import { Pagination } from "@/components/ui/pagination"

export interface FilterParameter<TData> {
  type: string;
  accessorKey: keyof TData & string;
  title: string;
  options: any[];
  multiple?: boolean;
  limitToFilteredRows?: boolean;
}

// Extract filters for display
export function getCurrentFilters<TData>(globalFilter: string | object, columnFilters: ColumnFiltersState) {
  return useMemo(() => {
    if (
      typeof globalFilter === "object" &&
      globalFilter &&
      "filters" in globalFilter
    ) {
      const filterObj = globalFilter as {
        filters: ExtendedColumnFilter<TData>[]
      }
      return filterObj.filters || []
    }
    return columnFilters
      .map(cf => cf.value)
      .filter(
        (v): v is ExtendedColumnFilter<TData> =>
          v !== null && typeof v === "object" && "id" in v,
      )
  }, [globalFilter, columnFilters])
}

// Handler for filter menu
export function getHandleFiltersChange<TData>(
  setColumnFilters?: (filters: ColumnFiltersState) => void,
  setGlobalFilter?: (filter: string | object) => void,
  setPagination?: (pagination: PaginationState | SetStateAction<PaginationState>) => void,  // 
) {
  return useCallback(
    (filters: ExtendedColumnFilter<TData>[] | null) => {
      if (!filters || filters.length === 0) {
        setColumnFilters && setColumnFilters([])
        setGlobalFilter && setGlobalFilter("")
        setPagination && setPagination((prev: PaginationState) => ({ ...prev, pageIndex: 0 }))
      } else {
        const hasOrFilters = filters.some(
          (filter, index) => index > 0 && filter.joinOperator === "or",
        )
        if (hasOrFilters) {
          setColumnFilters && setColumnFilters([])
          setGlobalFilter && setGlobalFilter({
            filters,
            joinOperator: "mixed",
          })
          setPagination && setPagination((prev: PaginationState) => ({ ...prev, pageIndex: 0 }))
        } else {
          setGlobalFilter && setGlobalFilter("")
          setColumnFilters && setColumnFilters(
            filters.map(filter => ({
              id: filter.id,
              value: filter,
            })),
          )
          setPagination && setPagination((prev: PaginationState) => ({ ...prev, pageIndex: 0 }))
        }
      }
    },
    [],
  )
}

// Filter toolbar component
export function FilterToolbar<TData>({
  filters,
  onFiltersChange,
  FilterParameters
}: {
  filters: ExtendedColumnFilter<TData>[]
  onFiltersChange: (filters: ExtendedColumnFilter<TData>[] | null) => void
  FilterParameters: FilterParameter<TData>[]
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
                  multiple={parameter.multiple}
                  limitToFilteredRows={parameter.limitToFilteredRows}
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
        <DataTableSearchFilter placeholder="검색어 입력" className="w-1/2"/>
      </DataTableToolbarSection>
    </DataTableToolbarSection>
  )
}

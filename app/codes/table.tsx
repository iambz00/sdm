"use client";

import { useState, useMemo } from "react";

import { Code } from "@/common/type/code";
import { useReactTable, Column, ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react";
import { useDebouncedCallback } from "use-debounce";


export default function CodeTable({ codeList }: { codeList: Code[]}) {
  // const columnHelper = createColumnHelper<Code>();
  const columns = useMemo<ColumnDef<Code>[]>(() =>
    [
      {
        id: "group_code",
        accessorFn: (row: Code) => (codeList.find(group => group.code === row.group_code)?.name),
        header: "코드 그룹",
        cell: (info: any) => info.getValue(),
        meta: {
          filterVariant: "select",
        }
      },
      {
        accessorKey: "code",
        header: "코드",
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: "name",
        header: "코드명",
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: "description",
        header: "설명",
        meta: {
          filterVariant: "text",
        },
        cell: (info: any) => info.getValue(),
      },
    ]
  , [codeList]);

  const table = useReactTable({
    columns,
    data: codeList,
    enableMultiSort: true,
    isMultiSortEvent: () => true, // Uncomment this to enable multi-sort without holding the Shift key
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetPageIndex: false,
  })
  
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead key={header.id} className="font-bold">
                {header.isPlaceholder ? null : (
                  <>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: <CaretUpIcon className="inline items-center ml-1"/>,
                        desc: <CaretDownIcon className="inline items-center ml-1"/>,
                      }[header.column.getIsSorted() as string] ?? null}
                    {header.column.getCanFilter() ? (
                      <div>
                        <Filter column={header.column} />
                      </div>
                    ) : null}
                    </div>
                  </>
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext(),
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  let codeGroups;
  if (filterVariant === "select") {
    codeGroups = useMemo(() => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues(), codeGroups]);
  }

  return filterVariant === 'range' ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === 'select' ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      {codeGroups?.map((group) => (
        <option key={group} value={group}>{group}</option>
      ))}
    </select>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
    // See faceted column filters example for datalist search suggestions
  )
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);
  const debounced = useDebouncedCallback(value => onChange(value), debounce);

  // Sync local state if initialValue changes externally (adjusting state based on props)
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setValue(initialValue);
  }

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        debounced(e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )
}

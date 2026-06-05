"use client";

import { useState, useEffect, Suspense, useTransition } from "react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"
import { ArrowSquareInIcon } from "@phosphor-icons/react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/* load the codepage support library for extended support with older formats  */
// import { set_cptable } from "xlsx";
// import * as cptable from 'xlsx/dist/cpexcel.full.mjs';
// set_cptable(cptable);

export default function DeviceImportBody() {
  const [workBook, setWorkBook] = useState<XLSX.WorkBook>();
  const [data, setData] = useState<any[][]>([]);
  const [merges, setMerges] = useState<XLSX.Range[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showOption, setShowOption] = useState(false);

  const [currentSheet, setCurrentSheet] = useState<string>();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function fileHandler(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    /* get data as an ArrayBuffer */
    const file = e.target.files[0];
    if (!file) return;
    setWorkBook(undefined);
    setData([]);
    setMerges([]);
    setCurrentSheet(undefined);

    const fileData = await file.arrayBuffer();

    const wb = XLSX.read(fileData, { dense: true, cellDates: true });
    setWorkBook(wb);

    setSelected(Object.fromEntries(wb.SheetNames.map((sheetName) => [sheetName, false])));
  }

  function sheetHandler(e: React.MouseEvent<HTMLButtonElement>) {
    const sheetName = e.currentTarget.textContent
    if (!workBook || !sheetName) return;

    if (e.ctrlKey) {
      setSelected(prevSelected => ({
        ...prevSelected,
        [sheetName]: !prevSelected[sheetName]
      }));
    }
    else if (e.shiftKey && currentSheet) {
      var [start, end] = [workBook.SheetNames.indexOf(currentSheet), workBook.SheetNames.indexOf(sheetName as string)]
      if (start > end) [start, end] = [end, start]
      setSelected(Object.fromEntries(workBook.SheetNames.map((sheetName, idx) => [sheetName, (start <= idx && idx <= end)])));
    }
    else {
      const ws = workBook.Sheets[sheetName];
      if (!ws) return;
      
      // 현재 선택 시트 표시를 먼저 업데이트하여 UI 반응성 확보
      setCurrentSheet(sheetName);

      // 무거운 작업은 Transition으로 감싸서 로딩 상태(isPending)를 유도
      startTransition(() => {
        const jsonData = XLSX.utils.sheet_to_json(ws, { 
          header: 1, 
          defval: null,
        }) as any[][];

        if (jsonData.length > 0) {
          const lastValidIndex = jsonData.reduceRight((found, curr, idx) => (found==-1 && curr.length > 0)? idx : found, -1)
          setData(jsonData.slice(0, lastValidIndex+1));
          setMerges(ws['!merges'] || []);
        }
      });
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 overflow-hidden">
        <div className="bg-primary/5 p-1">
          <div className="flex items-center">
            <Input type="file" className="min-w-1/3 max-w-3xs bg-background" 
              onChange={fileHandler}
            />
            <div className="flex-1 text-xs text-right">
              여기에 버튼 배치 - 범위 선택 / 가져오기
              <Toggle 
                variant="outline" 
                className="bg-background" 
                size="sm"
                pressed={showOption}
                onPressedChange={setShowOption}
              >
                <ArrowSquareInIcon />
                가져오기 설정
              </Toggle>
            </div>
          </div>
          <div className="py-1">
            <span className="text-primary text-sm font-bold">가져올 시트 선택</span>
            <span className="text-xs">(Shift-클릭: 범위 선택, Ctrl-클릭: 개별 선택, 클릭: 시트 내용 확인)</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {workBook?.SheetNames.map((sheetName, idx) => 
              <Button
                key={sheetName} 
                onClick={sheetHandler}
                variant={`${sheetName == currentSheet ? "default" : "outline"}`}
                className={`h-6 
                  ${selected[sheetName] ? "border-dotted border-destructive" : ""}
                `}
                disabled={isPending}
              >
                {sheetName}
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {isPending ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Spinner className="size-12 text-primary" />
              <p className="text-sm font-medium">시트 데이터를 처리하고 있습니다...</p>
            </div>
          ) : (
            <SheetView data={data} merges={merges}/>
          )}
        </div>
        {showOption && (
            <Card className="fixed right-10 z-30 w-xs mt-12 shadow-md border border-primary animate-in fade-in zoom-in-95">
              <CardHeader>
                <CardTitle>가져오기 설정</CardTitle>
              </CardHeader>
              <CardContent>
                {columnNames.map((name, idx) => (
                  <ImportOption key={idx}>
                    {name}
                  </ImportOption>
                ))}
              </CardContent>
            </Card>
        )}
      </div>
    </>
  )
}

function ImportOption({
  children
}:{
  children: string
}) {
  return (
    <div className="flex justify-between">
      <Label htmlFor={children} className="flex-1">
        {children}
      </Label>
      <Input id={children} className="w-2/3" />
    </div>
  )
}

export function SheetView({
  data,
  merges
}:{
  data: any[][],
  merges?: XLSX.Range[]
}) {
  // 병합 정보를 바탕으로 셀의 span과 노출 여부를 결정하는 헬퍼 함수
  const getCellSpanInfo = (r: number, c: number) => {
    const merge = merges?.find(m => r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c);
    if (!merge) return { rowSpan: 1, colSpan: 1, isHidden: false };

    // 병합의 시작 셀(왼쪽 상단)인 경우 span 계산
    if (r === merge.s.r && c === merge.s.c) {
      return {
        rowSpan: merge.e.r - merge.s.r + 1,
        colSpan: merge.e.c - merge.s.c + 1,
        isHidden: false
      };
    }
    // 병합 범위 내에 있지만 시작 셀이 아닌 경우 렌더링하지 않음
    return { rowSpan: 1, colSpan: 1, isHidden: true };
  }
  function toXLCol(col: number) {
    let columnName = "";
    while (col >= 0) {
      columnName = String.fromCharCode((col % 26) + 65) + columnName;
      col = Math.floor(col / 26) - 1;
    }
    return columnName;
  }

  // 전체 데이터 중 가장 긴 행의 길이를 계산하여 전체 컬럼 수를 구함
  const maxCols = data.reduce((maxLength, row) => Math.max(maxLength, row.length), 0);

  return (
    <Table className="border-separate border-spacing-0 border-b border-r [&_th]:border-l [&_th]:border-t [&_td]:border-l [&_td]:border-t">
      <TableHeader>
        <TableRow>
          <TableHead className="sticky z-20 top-0 left-0 border-r border-b">
          </TableHead>
          {Array.from({ length: maxCols }).map((_, j) => (
            <TableHead key={j} className="sticky z-10 top-0 text-center font-bold text-xs bg-muted border-b">
              {toXLCol(j)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            <TableHead className="sticky z-10 left-0 border-r text-center font-bold text-xs bg-muted">
              {i + 1}
            </TableHead>
            {row.map((cell, j) => {
              const { rowSpan, colSpan, isHidden } = getCellSpanInfo(i, j);
              if (isHidden) return null;
              return (
                <TableCell key={j} rowSpan={rowSpan} colSpan={colSpan} className="whitespace-pre text-xs"
                  onClick={(e) => {
                    const td = e.currentTarget as HTMLTableCellElement;
                    const tr = td.parentNode as HTMLTableRowElement;
                    console.log(toXLCol(td.cellIndex-1) + tr.rowIndex)
                  }}>
                  {cell instanceof Date ? cell.toLocaleDateString() : cell}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


/*
행, 컬럼 선택해야 함
부가정보는 컬럼명까지 입력받아서 선택 - 한글 가능?? 
시리얼번호가 비어 있는 곳에서 자동 멈춤
id 인 곳은 추가 기능까지?
*/
export interface Device {
  id: number;
  revision: number;

  serial_number: string;
  mac_address: string;
  asset_number: string;

  model_id: number;
  distribution_id: number;
  organization_code: string;
  status_code: string;
  usage_code: string;
  usage_group: string;

  metadata: string;

  created_by: string;
  updated_by: string;

  created_at: string;
  updated_at: string;
}

const columns = [
  "asset_number",       // [0]
  "model_id",           // [1]
  "distribution_id",    // [2]
  "usage_code",         // [3]
  "usage_group",        // [4]
  "serial_number",      // [5]
  "mac_address",        // [6]
  "metadata",           // [7]
  // "organization_code",
]

const columnNames = [
  "관리번호",           // [0]
  "모델명",             // [1]
  "보급 차수",          // [2]
  "용도 구분",          // [3]
  "용도 상세",          // [4]
  "S/N",                // [5]
  "WiFi MAC",           // [6]
  "부가 정보",          // [7]
]

const bgColors = [
  "bg-red-foreground",
  "bg-orange-foreground",
  "bg-amber-foreground",
  "bg-yellow-foreground",
  "bg-lime-foreground",
  "bg-green-foreground",
  "bg-emerald-foreground",
  "bg-teal-foreground",
  "bg-cyan-foreground",
  "bg-sky-foreground",
  "bg-blue-foreground",
  "bg-indigo-foreground",
  "bg-violet-foreground",
  "bg-purple-foreground",
  "bg-fuchsia-foreground",
  "bg-pink-foreground",
  "bg-rose-foreground",
  // "bg-slate-foreground",
  // "bg-gray-foreground",
  // "bg-zinc-foreground",
  // "bg-neutral-foreground",
  // "bg-stone-foreground",
  // "bg-taupe-foreground",
  // "bg-mauve-foreground",
  // "bg-mist-foreground",
  // "bg-olive-foreground",
]
//
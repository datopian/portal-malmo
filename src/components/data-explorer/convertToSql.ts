import { filterObj } from './search.schema'
import z from 'zod'

type FilterObjType = z.infer<typeof filterObj>

interface SortingObj {
    id: string
    desc: boolean
}

interface FilterObj {
    id: string
    value: FilterObjType[]
}

const allowedOperators = new Set([
    '=',
    '!=',
    '>',
    '<',
    '>=',
    '<=',
    'in',
    'not in',
    'like',
    'not like',
    'is null',
    'is not null',
])

function escapeSqlString(value: string) {
    return value.replace(/'/g, "''")
}

function quoteIdentifier(identifier: string) {
    return `"${identifier.replace(/"/g, '""')}"`
}

function assertAllowedTableName(tableName: string) {
    if (!/^[A-Za-z0-9_-]+$/.test(tableName)) {
        throw new Error(`Unsafe table name: ${tableName}`)
    }
}

function assertAllowedColumnId(columnId: string, allowedColumns: Set<string>) {
    if (!allowedColumns.has(columnId)) {
        throw new Error(`Unknown or unsafe column id: ${columnId}`)
    }
}

function buildSqlComparison(operation: string, rawValue: string) {
    const op = operation.toLowerCase()
    if (!allowedOperators.has(op)) {
        throw new Error(`Unsupported operator: ${operation}`)
    }

    if (op === 'is null' || op === 'is not null') {
        return op.toUpperCase()
    }

    const escapedValue = escapeSqlString(rawValue)
    return `${op.toUpperCase()} '${escapedValue}'`
}

export function convertToSql({
    tableName,
    columns,
    sorting,
    filters,
}: {
    tableName: string
    columns: string[]
    sorting: SortingObj[]
    filters: FilterObj[]
}) {
    assertAllowedTableName(tableName)
    const allowedColumns = new Set(columns)

    const sortSql =
        sorting.length > 0
            ? 'ORDER BY ' +
              sorting
                  .map((sort) => {
                      assertAllowedColumnId(sort.id, allowedColumns)
                      return `${quoteIdentifier(sort.id)} ${sort.desc ? 'DESC' : 'ASC'}`
                  })
                  .join(', ')
            : ''
    const filtersSql =
        filters.length > 0
            ? 'WHERE ' +
              filters
                  .map((filter) => {
                      assertAllowedColumnId(filter.id, allowedColumns)
                      const filterId = quoteIdentifier(filter.id)
                      const clauses = filter.value.filter((v) => v.value !== '')
                      if (clauses.length === 0) return ''

                      return clauses
                          .map((v, idx) => {
                              const comparison = buildSqlComparison(
                                  v.operation.value,
                                  v.value
                              )
                              if (idx === 0) {
                                  return `( ${filterId} ${comparison} )`
                              }

                              const rawLink = String(v.link ?? 'AND')
                                  .trim()
                                  .toUpperCase()
                              const link = rawLink === 'OR' ? 'OR' : 'AND'
                              return `${link} ( ${filterId} ${comparison} )`
                          })
                          .join(' ')
                  })
                  .filter(Boolean)
                  .join(' AND ')
            : ''
    return `SELECT * FROM ${quoteIdentifier(tableName)} ${filtersSql} ${sortSql}`
}

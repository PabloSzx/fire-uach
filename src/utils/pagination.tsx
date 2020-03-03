import { chunk, toInteger } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Pagination, PaginationProps } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

export function usePagination({
  name,
  componentProps = {},
}: {
  name: string;
  componentProps?: Partial<PaginationProps>;
}) {
  const [activePage, setActivePage] = useRememberState(name, 1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (totalPages && activePage > totalPages) {
      setActivePage(1);
    }
  }, [activePage, totalPages, setActivePage]);

  const pagination = useMemo(() => {
    return (
      <Pagination
        activePage={activePage}
        onPageChange={(_e, { activePage }) => {
          setActivePage(toInteger(activePage));
        }}
        totalPages={totalPages}
        secondary
        pointing
        {...componentProps}
      />
    );
  }, [activePage, setActivePage, totalPages, componentProps]);

  return {
    pagination,
    activePage,
    setActivePage,
    setTotalPages,
  };
}

export function usePaginationAllData<T = unknown>({
  name,
  data,
  n = 10,
  componentProps = {},
}: {
  name: string;
  data?: T[];
  n?: number;
  componentProps?: Partial<PaginationProps>;
}) {
  const [activePage, setActivePage] = useRememberState(name, 1);

  const paginatedData = useMemo(() => {
    return chunk(data ?? [], n);
  }, [data, n]);

  useEffect(() => {
    if (paginatedData.length && activePage > paginatedData.length) {
      setActivePage(1);
    }
  }, [activePage, paginatedData, setActivePage]);

  const pagination = useMemo(() => {
    return (
      <Pagination
        activePage={activePage}
        onPageChange={(_e, { activePage }) => {
          setActivePage(toInteger(activePage));
        }}
        totalPages={paginatedData.length}
        secondary
        pointing
        {...componentProps}
      />
    );
  }, [activePage, setActivePage, paginatedData, componentProps]);

  return {
    paginatedData,
    selectedData: paginatedData[activePage - 1] ?? [],
    pagination,
    activePage,
    setActivePage,
  };
}

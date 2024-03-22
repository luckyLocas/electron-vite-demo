import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, message, Popconfirm } from 'antd';
import { memo, useRef } from 'react';

import { DeleteRecord, GetTableData } from './services';
import PageContent from '@src/components/pageContent';

interface IColumns {
  id: string;
  name: string;
  localtion: string;
  remark: string;
}

/**
 * 列表页
 */
const TablePage = memo(() => {
  const tableRef = useRef<ActionType>();

  const columns: ProColumns<IColumns>[] = [
    { title: '序号', valueType: 'index', width: 60 },
    {
      title: '名称',
      dataIndex: 'name',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '位置',
      dataIndex: 'localtion',
      width: 200,
      hideInSearch: true,
    },
    { title: '备注', dataIndex: 'remark', hideInSearch: true },
    {
      title: '操作',
      width: 340,
      fixed: 'right',
      hideInSearch: true,
      render: (_text, record: { id: string }) => {
        return (
          <>
            <Popconfirm
              key="delete"
              title="确认删除该记录吗？"
              onConfirm={async () => {
                const res = await DeleteRecord({ id: record.id });
                if (res) {
                  message.success('删除成功');
                  tableRef.current?.reload();
                }
              }}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <PageContent title="列表页">
      <ProTable
        columns={columns}
        rowKey="id"
        bordered
        scroll={{
          y: '46vh',
        }}
        actionRef={tableRef}
        request={async params => {
          const rp = await GetTableData({
            ...params,
            pageNum: params.current,
          });
          return rp;
        }}
      />
    </PageContent>
  );
});
export default TablePage;

import HttpRequest from '@src/requests/request';

/**获取列表数据 */
export async function GetTableData(params: { pageNum?: number; pageSize?: number; wareHouseName?: string }) {
  return HttpRequest.pagingRequest('/api/company/page', params);
}

/**
 * 新增/编辑列表
 * @export
 * @param {id:string} request
 * @return {*}
 */
export async function AddOrEdit(params): Promise<boolean> {
  return HttpRequest.booleanRequest('AddOrEdit', params);
}

/**
 * 删除记录
 * @export
 * @param {id:string} request
 * @return {*}
 */
export async function DeleteRecord(params: { id?: string }): Promise<boolean> {
  return HttpRequest.booleanRequest('DeleteRecord', params);
}

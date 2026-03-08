export class vmSearchObj {
    pageNumber: number;
    maxSize: number;
    pageIndex: number;
    pageSizeSelected: number;
    totalCount: number;
    Page: string;
    pageSize: number;
    searchText?: string | null;
    fromDate?: Date;
    toDate?: Date;
    gender?: string;
    iView?: string;
    WishList?: any;
    status?: string;
    type: string;
    title?: string;
    // categoryId?: number;
    // subCategoryId?: number;
    // divisionId?: any;
    // subDivisionId?: any;
    // feederId?: number;
    // stealingFrom: string;
    // stealingFor: string;
    // walletId?: number;
    token?: string;
    withUserId?: string;
    UserId?: string;

    constructor() {
        this.pageIndex = 1;
        this.maxSize = 5;
        this.totalCount = 0;
        this.Page = "",
        this.pageNumber = 1;
        this.pageSize = 10;
        this.pageSizeSelected = 25;
        this.iView = "list";
        this.WishList = null,
        this.gender = "All";
        this.status = "All";
        this.type = "All";
        this.title = ""; 
        // this.stealingFrom = "All";
        // this.stealingFor = "All";
    }
}

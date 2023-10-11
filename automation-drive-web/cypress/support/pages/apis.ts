class APIs{
        APIfolderToTrash: 'https://api.internxt.com/drive/storage/trash/add'
        APIAccess: 'https://drive.internxt.com/api/access'
        APIfoldersInfo: 'https://api.internxt.com/drive/folders/72337979/folders/?offset=0&limit=50&sort=plainName&order=ASC'

        sendFolderToTrashAPI(newToken: string, folderID: string){
            return cy.request({
                method: 'POST',
                url: 'https://api.internxt.com/drive/storage/trash/add',
                headers: {
                    'Authorization': `Bearer ${newToken}`},
                body:{
                    items:[ 
                        {
                            id: folderID,
                            type: 'folder'
                        }]
                }
            }).then((response:any)=>{
                return response
            })
        }
        apiFolderInterception(){
            return cy.intercept('GET', 'https://api.internxt.com/drive/folders/72337979/folders/?offset=0&limit=50&sort=plainName&order=ASC')   
        }
        loginInterception(){
            return cy.intercept('POST', 'https://drive.internxt.com/api/access')
        }
    }   

    export const apis = new APIs()
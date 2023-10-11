import { removeLogs } from '../../support/utils/removeLogs'
import { drive } from '../../support/pages/drivePage'
import { shared } from '../../support/pages/sharedPage'
import data from '../../fixtures/data/staticData.json'
import { apis } from '../../support/pages/apis'
import { faker } from '@faker-js/faker'

const expectedURL: string = data.urls.app
const newFolderName: string = faker.music.genre()
const newFolderName2: string = faker.music.genre()
let foldersAssertion: Cypress.objectStructure ={
    folder1: '',
    folder2: '',
    folder3: '',
    folder4:''
}
let API: Cypress.folderInfoStructure ={
    folderID:'',
    folderName:'',
    newToken:'',
    folderID2:'',
    folderName2:''
}
const mainAccount:string= Cypress.env('MAIN_ACCOUNT')
const mainAccountPass: string =Cypress.env('MAIN_ACCOUNT_PASS')
const readerAccount: string = Cypress.env('READER_ACCOUNT')
const editorAccount: string = Cypress.env('EDITOR_ACCOUNT')
const password: string = Cypress.env('PASSWORD')

describe('Folder Creation and Initial Sharing',()=>{
    
    describe('User creates a new folder and shares it with another user',()=>{
        
        beforeEach('Login In',()=>{
            apis.loginInterception().as('login')
            cy.Login( mainAccount, mainAccountPass ); 
            cy.wait('@login').then((access: any)=>{
                expect(access.response.statusCode).to.equal(200)
                API.newToken= access.response.body.newToken
            })
         })
         it('TC: 1 | Validate that the user can create a new folder with right click option',()=>{
            
            cy.url().should('equal', expectedURL)
            drive.bodyRightClick()
            drive.clickNewFolderOption()
            drive.clearInputField()
            drive.writeNewFolderName(newFolderName)
            apis.apiFolderInterception().as('foldersInfo')
            drive.clickCreate(newFolderName)
            cy.wait('@foldersInfo').then((access:any)=>{
                drive.grabParentIDandFolderName(access.response.body.result, newFolderName).then(()=>{
                    API.folderName= Cypress.env('name')
                    API.folderID= Cypress.env('folderID')
                })
            }) 
        })
        it('TC: 2 | Validate that the user can share the folder with another user as an editor',{ keystrokeDelay: 10 },()=>{
            
            cy.url().should('equal', expectedURL)
            drive.selectFolderandRightClick(newFolderName).then(()=>{
                foldersAssertion.folder1=Cypress.env('folderName')
            })
            drive.clickonShareButtonOption()
            drive.clickPermissionsDropdown()
            drive.clickRestrictedButtonOption()
            drive.clickInviteButton()
            drive.writeInvitationEmail(editorAccount)
            drive.clickInviteUser()
            drive.invitationSentSuccess().then(()=>{
                expect(Cypress.env('success')).to.equal(data.assertion.invitationSentEditor)
            })
        })
        it('TC: 3 | Validate that the user can create and share the folder with another user as an reader',{ keystrokeDelay: 10 },()=>{
            
            cy.url().should('equal', expectedURL)
            drive.createFolder(newFolderName2)
            apis.apiFolderInterception().as('foldersInfo')
            drive.clickCreate(newFolderName2)
            cy.wait('@foldersInfo').then((access:any)=>{
                drive.grabParentIDandFolderName(access.response.body.result, newFolderName2).then(()=>{
                    API.folderName2= Cypress.env('name')
                    API.folderID2= Cypress.env('folderID')
                })
            })
            drive.shareCreatedFolder(readerAccount,newFolderName2,data.assertion.invitationSentReader).then(()=>{
                foldersAssertion.folder3= Cypress.env('folderName')
            })
        })
    })
    describe('User accepts invitation as Editor',()=>{
        before('Login In in editor account',()=>{
            cy.clearLocalStorage()
            cy.clearAllCookies()
            cy.clearAllSessionStorage()
            cy.Login(editorAccount, password);
        })
        it('TC: 4 | Verify that the shared folder appears in the recipients shared folder list.',()=>{
            
            cy.url().should('equal', expectedURL)
            drive.clickSharedPageButton()
            shared.clickPendingInvitationsButton()
            shared.acceptSharingInvitation(newFolderName).then(()=>{
                foldersAssertion.folder2= Cypress.env('folderAssertion')
            })
            cy.wrap(foldersAssertion).then(()=>{
                expect(foldersAssertion.folder1).to.equal(foldersAssertion.folder2)
            })
            shared.closeInvitationModal()
        })
    })
    describe('User accepts invitation as Reader',()=>{
        before('Login In in reader account',()=>{
            cy.clearLocalStorage()
            cy.clearAllCookies()
            cy.clearAllSessionStorage()
            cy.Login(readerAccount, password);
            
        })
        after('Deleting Folder Owner created',()=>{
            cy.clearLocalStorage()
            cy.clearAllCookies()
            cy.clearAllSessionStorage()
            apis.loginInterception().as('login')
            cy.Login(mainAccount, mainAccountPass)
            cy.wait('@login').then((access: any)=>{
                API.newToken= access.response.body.newToken
                apis.sendFolderToTrashAPI(API.newToken, API.folderID).then(response=> expect(response.status).to.equal(200))
                apis.sendFolderToTrashAPI(API.newToken, API.folderID2).then(response=> expect(response.status).to.equal(200))
            })
            cy.reload()
        })
        
        
        it('TC: 5 | Verify that the shared folder appears in the recipients shared folder list.',()=>{
            
            cy.url().should('equal', expectedURL)
            drive.clickSharedPageButton()
            shared.clickPendingInvitationsButton()
            shared.acceptSharingInvitation(newFolderName2).then(()=>{
                foldersAssertion.folder4= Cypress.env('folderAssertion')
            })
            cy.wrap(foldersAssertion).then(()=>{
                expect(foldersAssertion.folder3).to.equal(foldersAssertion.folder4)
            })
            shared.closeInvitationModal()
        })
    })

})

removeLogs()
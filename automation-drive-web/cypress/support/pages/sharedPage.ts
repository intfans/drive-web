class Shared{
    pendingInvitationButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    pendingInvitationModal:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    sharedFolderName:() => Cypress.Chainable<JQuery<HTMLElement>>;
    acceptSharedFolderButton:() => Cypress.Chainable<JQuery<HTMLElement>>;
    closePendingInvitationModalButton:() => Cypress.Chainable<JQuery<HTMLElement>>;
    eachFolderWrapper:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    foldersText:()=> Cypress.Chainable<JQuery<HTMLElement>>;

    constructor(){
        this.pendingInvitationButton=()=> cy.get('[class$="text-gray-80 shadow-sm "]'),
        this.pendingInvitationModal=()=> cy.get('[class$="duration-100 ease-out"]')
        this.sharedFolderName=()=> cy.get('[class="truncate font-medium text-gray-100"]'),
        this.acceptSharedFolderButton=()=> cy.get('[class$="text-white shadow-sm "]'),
        this.closePendingInvitationModalButton=()=> cy.get('[class="flex h-full flex-col items-center justify-center"]')
        this.eachFolderWrapper=()=> cy.get('[class=" flex w-full flex-col space-y-3.5"]')
        this.foldersText=()=> cy.get('[class="truncate font-medium text-gray-100"]')
    }
    clickPendingInvitationsButton(){
        this.pendingInvitationButton().click()
    }
     acceptSharingInvitation(foldername:string){
        return this.pendingInvitationModal().within(()=>{
            this.eachFolderWrapper().then(()=>{
                this.foldersText().each(($fold, index) =>{
                    if($fold.text()===foldername){
                        this.eachFolderWrapper().eq(index).within(()=>{
                            this.acceptSharedFolderButton().click()
                            this.foldersText().then(name=>{
                                return Cypress.env('folderAssertion', name.text())
                            })
                        })
                    }
                })
            })
        })
    }
    closeInvitationModal(){
        this.closePendingInvitationModalButton().click()
    }
    
}
export const shared = new Shared()
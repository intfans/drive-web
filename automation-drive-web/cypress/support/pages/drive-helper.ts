class Drive{

    uploadFilesButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    items:() => Cypress.Chainable<JQuery<HTMLElement>>;
    shareButton: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    accessWrapper:() => Cypress.Chainable<JQuery<HTMLElement>>;
    accessTitle: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    dropdown: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    publicButton: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    restrictedButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingButton: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    buttonTextBefore: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    buttonTextAfter: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    inviteButtonWrapper:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    manageAccessOption: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    downloadOption: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    optionsDisplayer: () => Cypress.Chainable<JQuery<HTMLElement>>;
    options: () => Cypress.Chainable<JQuery<HTMLElement>>;
    button: () => Cypress.Chainable<JQuery<HTMLElement>>;
    text: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingModal: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingTitle: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingWarning: () => Cypress.Chainable<JQuery<HTMLElement>>;
    cancelStopSharingConfirm: () => Cypress.Chainable<JQuery<HTMLElement>>;
    cancelStopSharingText: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingButtonConfirm: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingButtonConfirmText: () => Cypress.Chainable<JQuery<HTMLElement>>;
    confirmationSign: () => Cypress.Chainable<JQuery<HTMLElement>>;
    createNewFolder: () => Cypress.Chainable<JQuery<HTMLElement>>;
    newFolderModal: () => Cypress.Chainable<JQuery<HTMLElement>>;
    closeModalButton:() => Cypress.Chainable<JQuery<HTMLElement>>;
    closeShareOptions: () => Cypress.Chainable<JQuery<HTMLElement>>;


    constructor(){
        this.uploadFilesButton= () => cy.get('button[class$="border-opacity-75"]').parent(),
        this.items = ()=> cy.get('[data-test="file-list-folder"]'),
        this.shareButton= ()=> cy.get('[data-tooltip-id="share-tooltip"]'),
        this.accessWrapper = ()=> cy.get('[class="flex flex-col space-y-2.5"]'),
        this.accessTitle = ()=> cy.get('p[class="font-medium"]'),
        this.dropdown = ()=> cy.get('button[class$="text-gray-80 shadow-sm "]').last(),
        this.publicButton = ()=> cy.get('[class^="flex h-16 w-full cursor-pointer"]').first(),
        this.restrictedButton = ()=> cy.get('[class^="flex h-16 w-full cursor-pointer"]').last(),
        this.stopSharingButton = ()=> cy.get('[class^="flex h-11 w-full"]'),
        this.buttonTextBefore = ()=> cy.get('button[class$="text-gray-80 shadow-sm "] span'),
        this.buttonTextAfter = ()=> cy.get('button[class$="text-gray-80 shadow-sm "] span').last(),
        this.inviteButtonWrapper=()=> cy.get('[class="flex items-center space-x-1.5"]'),
        this.manageAccessOption=()=> cy.get('[class$="text-base text-gray-80"]').first(),
        this.downloadOption= ()=> cy.get('[class="flex cursor-pointer flex-row whitespace-nowrap px-4 py-1.5 text-base text-gray-80"]').eq(5),
        this.optionsDisplayer=()=> cy.get('[aria-labelledby="list-item-menu-button"]'),
        this.options= ()=> cy.get('span:not(.ml-5)'),
        this.button= ()=> cy.get('button'),
        this.text= ()=> cy.get('span'),
        //stop sharing modal
        this.stopSharingModal=()=> cy.get('[class^="w-full text-gray-100 max-w-sm"]'),
        this.stopSharingTitle=()=> cy.get('[class="text-2xl font-medium"]'),
        this.stopSharingWarning=()=> cy.get('[class="text-lg text-gray-80"]'),
        this.cancelStopSharingConfirm= ()=> cy.get('[class$="text-gray-80 shadow-sm "]'),
        this.cancelStopSharingText= ()=> cy.get('div.flex.items-center.justify-center.space-x-2').first(),
        this.stopSharingButtonConfirm= ()=> cy.get('[class$="active:bg-red-dark text-white shadow-sm "]'),
        this.stopSharingButtonConfirmText= ()=> cy.get('div.flex.items-center.justify-center.space-x-2').last(),
        this.closeShareOptions = () => cy.get('[class$="active:bg-opacity-8"]')

        this.confirmationSign= ()=> cy.get('[class="flex max-w-xl items-center rounded-lg border border-gray-10 bg-white p-3 shadow-subtle-hard"]'),
        //create New Folder
        this.createNewFolder=()=> cy.get('[data-tooltip-id="createfolder-tooltip"]'),
        this.newFolderModal= ()=> cy.get('[class^="w-full text-gray-100"]'),

        this.closeModalButton=()=> cy.get('[class="absolute right-0 m-7 flex w-auto text-white"]')
    }

    async clickUploadButton(){
        this.uploadFilesButton().click()
    }
    async selectRandomItem(){
        this.items().then(el =>{
            const items = el.length
            const number= Cypress._.random(0, items -1)
            this.items().eq(number).click()
        })
    }
    async clickonShareButton(){
        this.shareButton().click()
    }
    async clickPermissionsDropdown(){
        this.accessWrapper().within(()=>{
            this.accessTitle().should('have.text', 'General access')
            this.buttonTextBefore().should('have.text', 'Public')
            this.dropdown().click()
        })
    }
    async clickRestrictedButton(){
        this.restrictedButton().click({force:true})
        this.buttonTextAfter().should('have.text', 'Restricted')
    }
    async clickPublicButton(){
        this.publicButton().click()
    }
    async clickStopSharingButton(){
        this.stopSharingButton().click({force:true})

    }
    async confirmStopSharing(){
        this.stopSharingModal().should('exist')
        this.stopSharingModal().within(()=>{
            this.stopSharingTitle().then(text=>{
                expect(text.text()).to.exist
            })
            this.stopSharingWarning().then(warning=>{
                expect(warning.text()).to.exist
            })
            this.stopSharingButtonConfirm().should('exist')
            this.stopSharingButtonConfirmText().then(button=>{
                expect(button.text()).to.exist
            })
            this.cancelStopSharingConfirm().should('exist')
            this.cancelStopSharingText().then(cancel=>{
                expect(cancel.text()).to.exist
            })
        })
        this.stopSharingButtonConfirm().click()
        this.confirmationSign().then(sign=>{
            expect(sign.text()).to.exist
        })
    }
    inviteButton(){
        return this.inviteButtonWrapper().within(()=>{
            this.button()
        })
    }
    async selectRandomItemAndRightClick(){
        this.items().then(el =>{
            const items = el.length
            const number= Cypress._.random(0, items -1)
            this.items().eq(number).rightclick()
        })
        this.optionsDisplayer().within(()=>{
            this.options().each(opts=>{
               expect(opts.text()).to.exist
            })
          })
    }
    async clickShareOption(){
        this.manageAccessOption().click()
    }
    async clickCreateNewFolder(){
        this.createNewFolder().click()
    }
    async writeNewFolderName(){
        this.newFolderModal().should('exist')

    }
    async closeSharingOptions(){
        this.closeShareOptions().click()
    }
    async closeModal(){
        this.closeModalButton().click()
    }
    
}
export const driveHelper = new Drive()
import { removeLogs } from '../../support/utils/removeLogs'
import { driveHelper } from '../../support/pages/drive-helper';

describe('AFS | Owner-Shared-Folder-Permission-Feature', () => {
  beforeEach('Logging in', () => {
    cy.Login();
    cy.wait(6000);
  });
  it.only("TC: 1 | Validate that the owner can change permissions of a random shared folder from restricted to 'Public' with the 'Share' button", () => {
    
    driveHelper.closeModal()
    driveHelper.selectRandomItem();
    driveHelper.clickonShareButton();
    driveHelper.clickPermissionsDropdown();
    driveHelper.clickPublicButton();
    driveHelper.closeSharingOptions()
  });
  it("TC: 2 | Validate that the owner can change permissions of a random shared folder from restricted to 'Public' with right click", () => {
    driveHelper.selectRandomItemAndRightClick();
    driveHelper.clickShareOption();
    driveHelper.clickPermissionsDropdown();
    driveHelper.clickPublicButton();
  });
  it("TC: 3 | Validate that the owner can change permissions of a random shared folder to 'Stop Sharing' with the 'Share' button.", () => {
    driveHelper.selectRandomItem();
    driveHelper.clickonShareButton();
    driveHelper.clickPermissionsDropdown();
    driveHelper.clickStopSharingButton();
    driveHelper.confirmStopSharing();
  });
  it("TC: 4 | Validate that the owner can change permissions of a random shared folder to 'Stop Sharing' with right click", () => {
    driveHelper.selectRandomItemAndRightClick();
    driveHelper.clickShareOption();
    driveHelper.clickPermissionsDropdown();
    driveHelper.clickStopSharingButton();
    driveHelper.confirmStopSharing();
  });
});

removeLogs();

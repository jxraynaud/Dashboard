import { Dashboard.BlizzardPage } from './app.po';

describe('dashboard.blizzard App', () => {
  let page: Dashboard.BlizzardPage;

  beforeEach(() => {
    page = new Dashboard.BlizzardPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

import loadTheme from './loadTheme';

interface RenderHTMLArgs {
  resume: object;
  themePath: string;
}

const renderHTML = async ({
  resume,
  themePath,
}: RenderHTMLArgs): Promise<any> => {
  const theme = loadTheme(themePath);
  if (typeof theme?.render !== 'function') {
    throw new Error('theme.render is not a function');
  }

  return await theme.render(resume);
};

export default renderHTML;

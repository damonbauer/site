const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const cleanCSS = require("clean-css");

module.exports = eleventyConfig => {
  eleventyConfig.addFilter("cssmin", (code) => 
    new cleanCSS({}).minify(code).styles);

  eleventyConfig.addPlugin(syntaxHighlight);
  
  return {
    htmlTemplateEngine: "liquid"
  };
};

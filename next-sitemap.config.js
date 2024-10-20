const excludedPaths = ["/blockchain", "/utils"];

module.exports = {
  siteUrl: "https://oxiswap.com", 
  generateRobotsTxt: true, 
  exclude: excludedPaths.concat(["/[sitemap]"]), 
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: excludedPaths, 
      },
    ],
  },
};
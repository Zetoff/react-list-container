Package.describe({
  name: "utilities:react-list-container",
  summary: "List container for React",
  version: "0.1.5",
  git: "https://github.com/meteor-utilities/react-list-container.git"
});

Package.onUse(function(api) {

  api.versionsFrom("METEOR@1.3-beta.11");
  
  api.use([
    'ecmascript',
    'react-meteor-data@0.2.6-beta.16',
    'tmeasday:check-npm-versions@0.1.1',
    'tmeasday:publish-counts@0.7.3'
  ]);

  api.mainModule("lib/export.js", ["client", "server"]);

});

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [],
  options: {
    exclude: {
      path: ['node_modules', 'public', 'prisma/migrations']
    },
    includeOnly: '^src',
    tsPreCompilationDeps: false,
    tsConfig: {
      fileName: null
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^node_modules/[^/]+',
        theme: {
          graph: {
            splines: 'ortho'
          },
          modules: [
            {
              criteria: { matchesFocus: true },
              attributes: { fillcolor: 'orange', penwidth: 3 }
            },
            {
              criteria: { reachesTypescriptOnly: true },
              attributes: { fillcolor: 'grey' }
            }
          ],
          dependencies: [
            {
              criteria: { resolved: '^node_modules/' },
              attributes: { fillcolor: 'grey' }
            },
            {
              criteria: { couldNotResolve: true },
              attributes: { color: 'red' }
            }
          ]
        }
      },
      archi: {
        collapsePattern: '^node_modules/[^/]+',
        theme: {
          modules: [
            {
              criteria: { matchesFocus: true },
              attributes: { fillcolor: 'orange', penwidth: 3 }
            }
          ]
        }
      },
      mermaid: {
        theme: 'default',
        themeVariables: {
          primaryColor: '#ff6361',
          primaryTextColor: '#fff',
          primaryBorderColor: '#7C0000',
          lineColor: '#F8B229',
          secondaryColor: '#006100',
          tertiaryColor: '#fff'
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true
        }
      }
    }
  }
};



/**
 * * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'welcome',
      label: 'Welcome'
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['getting_started/requirements', 'getting_started/configuration']
    },
    {
      type: 'category',
      label: 'Installation',
      collapsed: true,
      items: [
        'installation/overview',
        'installation/docker',
        'installation/docker_compose',
        'installation/kubernetes',
        'installation/helm',
        'installation/port_forward'
      ]
    },
    {
      type: 'category',
      label: 'Basics',
      collapsed: true,
      items: ['basics/overview', 'basics/identity', 'basics/streams']
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: true,
      items: ['examples/create_identity', 'examples/issue_credential', 'examples/verify_credential', 'examples/create_stream', 'examples/read_stream']
    },
    {
      type: 'doc',
      id: 'api_reference',
      label: 'API Reference'
    },
    {
      type: 'doc',
      id: 'troubleshooting',
      label: 'Troubleshooting'
    },
    {
      type: 'doc',
      id: 'faq',
      label: 'FAQ'
    },
    {
      type: 'doc',
      id: 'contribute',
      label: 'Contribute'
    },
    {
      type: 'doc',
      id: 'code_of_conduct',
      label: 'Code of Conduct'
    }
  ]
};

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
      items: [
        'getting_started/requirements',
        'installation/overview',
        {
          type: 'category',
          label: 'Docker Compose',
          collapsed: false,
          items: [
            'installation/docker_compose/docker_compose',
            'installation/docker_compose/expose_apis',
          ]
        },
        {
          type: 'category',
          label: 'Kubernetes',
          collapsed: false,
          items: [
            'installation/kubernetes/local_setup',
            'installation/kubernetes/expose_apis',
            'installation/kubernetes/configuration'
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: true,
      items: [
        'examples/index',
        'examples/how-to-run-examples',
        'examples/create-identity-and-credentials'
      ]
    },
    {
      type: 'category',
      label: 'Using Decentralized Identities',
      collapsed: true,
      items: [
        'examples/intro_identity', 
        'examples/create_identity', 
        'examples/issue_credential', 
        'examples/verify_credential', 
        'examples/create_stream', 
        'examples/read_stream']
    },
    {
      type: 'category',
      label: 'Using Audit Trail',
      collapsed: true,
      items: [
        'examples/intro_audittrail', 
        'examples/create_channel',
        'examples/subscribe_channel', 
        'examples/authorize_subscriber', 
        'examples/read_write_channel'
      ]
    },
    {
      type: 'category',
      label: 'Basics',
      collapsed: true,
      items: ['basics/overview', 'basics/identity', 'basics/streams']
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
      id: 'contact',
      label: 'Contact'
    }
  ]
};

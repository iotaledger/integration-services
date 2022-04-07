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
      type: "doc",
      id: "welcome",
      label: "Welcome",
    },
    {
      type: "category",
      label: "Services",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Audit Trail Gateway",
          items: [
            {
              type: "doc",
              id: "services/audit-trail-gateway/introduction",
              label: "Introduction",
            },
            "services/audit-trail-gateway/API-definition",
            "services/audit-trail-gateway/use-cases",
          ],
        },
        {
          type: "category",
          label: "SSI Bridge",
          items: [
            {
              type: "doc",
              id: "services/SSI-bridge/introduction",
              label: "Introduction",
            },
            "services/SSI-bridge/API-definition",
            "services/SSI-bridge/use-cases",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: [
        "getting_started/overview",
        {
          type: "doc",
          label: "Node.js",
          id: "getting_started/installation/node_setup",
        },
        {
          type: "category",
          label: "Kubernetes",
          items: [
            "getting_started/installation/kubernetes/local_setup",
            "getting_started/installation/kubernetes/configuration",
          ],
        },
        {
          type: "doc",
          label: "Docker Compose",
          id: "getting_started/installation/docker_compose_setup",
        },
      ],
    },
    {
      type: "category",
      label: "Basics",
      collapsed: true,
      items: [
        {
          type: "category",
          label: "Authentication",
          items: [
            "basics/authentication/concept",
            "basics/authentication/example_node",
            "basics/authentication/example_is_sdk",
          ],
        },
        "basics/identity",
        "basics/streams",
      ],
    },
    {
      type: "category",
      label: "Examples",
      collapsed: true,
      items: [
        "examples/introduction",
        "examples/how-to-run-examples",
        "examples/create-identity-and-credentials",
        "examples/update-users",
        "examples/delete-users",
        "examples/trusted-authorities",
        "examples/create-channel",
        "examples/authorize-to-channel",
        "examples/search-channel-and-validate-data",
      ],
    },
    {
      type: "doc",
      id: "audit_trail_gw_api_reference",
      label: "Audit-Trail GW API Reference",
    },
    {
      type: "doc",
      id: "ssi_bridge_api_reference",
      label: "SSI-Bridge API Reference",
    },
    {
      type: "doc",
      id: "troubleshooting",
      label: "Troubleshooting",
    },
    {
      type: "doc",
      id: "faq",
      label: "FAQ",
    },
    {
      type: "doc",
      id: "contribute",
      label: "Contribute",
    },
    {
      type: "doc",
      id: "contact",
      label: "Contact",
    },
  ],
};

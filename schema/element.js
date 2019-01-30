const graphql = require('graphql');
const $ = require('cheerio');
const _ = require('underscore');

const {
  GraphQLString,
  GraphQLBoolean
} = graphql;
const recursiveArgs = {
  elem: {
    type: GraphQLString,
  },
};

const resolve = (root, args) => root(args.elem);

const selector = (root, args) => {
  const html = $(root).html();
  // Need XML Mode true so that all HTML works.
  // e.g. Without it would not pase <tr><td>BLah</td></td> correctly
  return $.load(html, {
    xmlMode: true
  })(args.elem);
}

const element = new graphql.GraphQLObjectType({
  name: 'Element',
  fields: () => ({
    select: {
      args: recursiveArgs,
      description: 'Get an element from inside of this element',
      resolve: (root, args) => selector(root, args),
      type: element,
    },
    selectAll: {
      args: recursiveArgs,
      description: 'Get an element from inside of this element',
      resolve: (root, args) => selector(root, args),
      type: new graphql.GraphQLList(element),
    },
    content: {
      type: graphql.GraphQLString,
      description: 'The HTML content of the subnodes',
      args: recursiveArgs,
      resolve(root, { elem }) {
        var $root = elem ? $(root).find(elem) : $(root)
        return $root.html()
      },
    },
    count: {
      args: recursiveArgs,
      description: 'Get a count of provided elements',
      resolve: (root, args) => selector(root, args).length,
      type: graphql.GraphQLInt,
    },
    classList: {
      description: 'Get a list of the classes on the given element',
      resolve: root => $(root).attr('class').split(' '),
      type: new graphql.GraphQLList(GraphQLString),
    },
    class: {
      description: 'Get the class attribute on the given element',
        resolve: root => $(root).attr('class'),
        type: GraphQLString,
    },
    html: {
      description: 'The inner html of the element',
      args: recursiveArgs,
      resolve: root => {
        var $root = elem ? $(root).find(elem) : $(root)

        return $root.html()
      },
      type: GraphQLString
    },
    text: {
      type: GraphQLString,
      description: 'The text content of the selected DOM node',
      args: recursiveArgs,
      resolve(root, { elem }) {
        var $root = elem ? $(root).find(elem) : $(root)

        return $root.text()
      },
    },
    href: {
      type: GraphQLString,
      description: 'Get the href of the element',
      args: recursiveArgs,
      resolve(root, { elem }) {
        var $root = elem ? $(root).find(elem) : $(root)

        return $root.attr('href')
      },
    },
    src: {
      description: 'Get the src of the element',
      args: recursiveArgs,
      resolve(root, { elem }) {
        var $root = elem ? $(root).find(elem) : $(root)

        return $root.attr('src')
      },
      type: GraphQLString,
    },
    has: {
      type: GraphQLBoolean,
      description: 'Returns true if an element with the given selector exists.',
      args: recursiveArgs,
      resolve(root, { elem }) {
        return !!$(root).find(elem).length
      },
    },
    /**
     * Looks for data attribute on element,
     * if the `name` argument is provided
     * then grab the specific `data-${name}`
     * attribute.
     */
    data: {
      args: {
        name: {
          type: GraphQLString,
        },
      },
      description: 'Get the data attribute for element, if name is provided will grab that specific data attribute',
      resolve: (root, args) => {
        if (args.name && args.name.trim() !== '') {
          return $(root).data(args.name);
        }
        return $(root).attr('data');
      },
      type: GraphQLString,
    },
    attr: {
      args: {
        name: {
          type: GraphQLString,
        },
      },
      description: 'Get an attribute off of the element',
      resolve: (root, args) => $(root).attr(args.name),
      type: GraphQLString,
    },
  }),
});

module.exports = {
  args: recursiveArgs,
  resolve,
  type: element,
};

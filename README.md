# React List Container

A set of React container components (list & item) used to manage template-level subscriptions in Meteor apps. Supports client-side joins and nested trees.

### Install

`meteor add utilities:react-list-container`

### Usage

A *container* is a special React component that doesn't output any HTML. Instead, its whole job is to fetch data and pass it on as props to its child components. 

This package provides two containers that help you fetch data and pass it as props either for a paginated list of documents, or for a single document. 

You can import and use the containers with:

```js
import Containers from "meteor/utilities:react-list-container";

const ListContainer = Containers.ListContainer;
const DocumentContainer = Containers.DocumentContainer;

```

## List Container

### Usage

To use the list container, just wrap it around a child component:

```jsx
<ListContainer collection={Posts} publication="posts.list">
  <PostList/>
</ListContainer>
```

Or alternatively pass the child component as the `component` argument:

```jsx
<ListContainer collection={Posts} publication="posts.list" component={PostList}/>
```

### Input

The list container accepts the following props:

#### Basic Props

##### `collection` (object|function) [required]

The Meteor collection in which to look for data, or alternatively a function returning the collection or an Astronomy class.

Example:

```js
// meteor collection
collection = Categories;

// passing an astronomy class
const Category = AstronomyClass.create({
  collection: Categories,
});
collection = () => Category;
```

##### `selector` (object)

The selector (as in `Collection.find(selector, options)`) used on the client to query for data. If not provided, will default to `{}`.

##### `options` (object)

The options used on the client to sort and limit data. If not provided, will default to `{}`.

##### `publication` (string)

Optionally, the name of a publication to which to subscribe to. If not provided, the container will assume the required data has already been published.

##### `terms` (object)

If a publication is provided, an object passed as argument to the publication when subscribing. If not provided, the container will subscribe without providing any arguments.

##### `limit` (number)

How many documents to initially query. Defaults to `10`.

##### `increment` (number)

How much to increment the list by every time. Defaults to `10`. If set to `0`, the container will always act as if they were no more elements to more (`hasMore` equals `false`).

##### `component` (object)

The component to be wrapped by the container (can also be passed as child).

##### `componentProps` (object)

Properties passed to the component (when specified as attribute) in addition to the ones provided by the container. 

##### `componentProps` (object)

#### Advanced Props

Additionally, the following advanced features are also available: 

##### `joins` (array)

An array of joins. Each join object has the following properties:

- `localProperty` (string): the property in the current collection containing the join info (for example, a `categories` property containing an array of a post's categories' `_id`s).
- `foreignProperty` (string): the property in the *other* collection containing the `_id` of documents in the current collection (for example, a `postId` property on the `Comments` collection for comments belonging to a post).
- `collection` (object|function): the collection in which to look for the documents to join (or alternatively a function returning the collection).
- `joinAs` (string): the new property under which to store the result of the join.

The container makes the following assumptions:

- The `localProperty` property contain either a single `_id`, or an array of `_id`s.
- The `foreignProperty` property contain a single `_id`.
- You can't have both a `localProperty` and a `foreignProperty`. 
- The data required by the join is published by the `publication` publication, or else has already been published independently.

Example:

```js
joins = [
  {
    localProperty: "userId",
    collection: Meteor.users,
    joinAs: "author"
  },
  {
    localProperty: "categoriesId",
    collection: Categories,
    joinAs: "categories"
  },
  {
    foreignProperty: "postId",
    collection: () => Comments,
    joinAs: "comments"
  }
]
```

##### `parentProperty` (string)

The name of a property storing the parent node's `_id` to use to “unflatted” the list of documents into a tree.

In the following example, you would pass `parentCommentId` as the `parentProperty`:

```js
[
  {
    _id: 1,
    title: "A comment"
  },
  {
    _id: 2,
    title: "Another comment"
  },
  {
    _id: 3,
    title: "A reply to the first comment",
    parentCommentId: 1
  }
]
```

Note: make sure to pass `0` as a limit to load all documents when using trees.

##### `resultsPropName` (string)

By default, the container will store its results in a `results` property. You can optionally pass a different property name. 

##### `cacheSubscription` (bool)

Set to `true` to cache your subscription using [Subs Manager](https://github.com/kadirahq/subs-manager).

##### `listId` (string)

A unique name or ID for the current list. 

### Output

The list container passes on the following props:

##### `currentUser` (object)

The current Meteor user.

##### `results` (array)

The documents outputted by the list container.

##### `count` (number)

A count of the documents.

##### `totalCount` (number)

A count of the *total number of documents* matching the query *on the server*.

(Note: will only be available if you're publishing a count with the same name as the publication using the [publish-counts](https://github.com/percolatestudio/publish-counts) package).

##### `hasMore` (boolean)

Whether there is more content to load or not. Also see above note about requiring the [publish-counts](https://github.com/percolatestudio/publish-counts) package.

##### `ready` (boolean)

Whether the subscription is ready (default to `true` if there is no subscription).

##### `loadMore` (function)

A callback function that loads the next items in the list. 

## Document Container

### Usage

Similarly to the list component, this container will pass props to any child component. But unlike the list container, it only works for single documents:

```jsx
<DocumentContainer collection={Posts} selector={{_id: "xyz"}}>
  <Post/>
</DocumentContainer>
```

### Input

The item container accepts the following props:

##### `collection` (object) [required]

See list container.

##### `selector` (object) [required]

See list container.

##### `publication` (string)

See list container.

##### `terms` (object)

See list container.

##### `joins` (array)

See list container.

##### `component` (object)

See list container.

##### `componentProps` (object)

See list container.

##### `loading` (component)

A React component to display while the subscription is working.

##### `documentPropName` (string)

By default, the container will store its results in a `document` property. You can optionally pass a different property name. 

### Output

The item container passes on the following props:

##### `currentUser`

The current Meteor user.

##### `document`

The document.

## CursorCounts

**Note: doesn't work after all, keeping this here for reference's sake. Use [publish-counts](https://github.com/percolatestudio/publish-counts) instead.**

This package also provides a `CursorCounts` object to keep track of cursor counts (i.e. how many total results exist in the database for a given cursor).

It exposes two methods, `set` and `get`. In both cases, `terms` should be an object whose property can uniquely identify a cursor, such as your subscription terms for example:

```js
terms = {
  publication: "posts",
  selector: {
    status: 2
  },
  options: {
    sort: {
      postedAt: -1
    }
  }
}
```

Note: your terms should ideally include a unique identifier for the current publication to avoid any ambiguity in case the same selector/options pair is reused in a different context. 

##### `set(terms, count)`

Call this from within your publication to update a count:

```js
import { CursorCounts } from "meteor/utilities:react-list-container";

Meteor.publish('posts', function (terms) {

  const posts = Posts.find(terms.selector, terms.options);

  CursorCounts.set(terms, posts.count());

  return posts;    

});
```

##### `get(terms)`

Retrieve the total count for a given cursor. 
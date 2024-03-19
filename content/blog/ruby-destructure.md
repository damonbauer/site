---
title: Argument Destructuring In Ruby
date: 2019-12-29
---

With a hash in the following structure:

``` ruby
{
  "2019-12-01": [{title: "a title"}, {title: "another title"}],
  "2019-11-01": [{title: "a title"}, {title: "another title"}],
  ...
}
```

I wanted to iterate over it and find out the index of the iteration. This is easy enough to do, like so:

``` ruby
hash.each_with_index.map { |collection, index| ... }
```

The problem lies with the `collection` argument. Since my "collection" in each iteration is a key ("2019-12-01") and a value (the array of hashes), the `collection` argument doesn't really tell me a whole lot about what it contains.

Let's say I wanted to display the date and render a partial for each hash in the array:

``` ruby
<% hash.each_with_index.map { |collection, index| ... } %>
  <div id="container-<%= index %>">
    <p>Date: <%= collection.first %></p>
    <%= render partial: "items" collection: collection.second %>
  </div>
<% end %>
```

The `collection.first` and `collection.second` have no meaning and are really difficult to understand what they are, so I wanted to fix that.

I could "add" meaning, at the cost of assigning 2 variables in each iteration:

``` ruby
<% hash.each_with_index.map { |collection, index| ... } %>
  <% date = collection.first %>
  <% items = collection.second %>
  
  <div id="container-<%= index %>">
    <p>Date: <%= date %></p>
    <%= render partial: "items" collection: items %>
  </div>
<% end %>
```

However, I don't like this approach because:

1. The aforementioned need to assign variables in each iteration
2. This works for a simple key/value hash setup like this example, but might not work for anything more complex
3. If the order of the `collection` hash changes, the variable have to change, too

Coming from the JavaScript world, I've used `destructuring` quite often:

``` js
const obj = { a: "foo", b: "bar" }

// destructure
const { a, b } = obj;

console.log(a) // "foo"
console.log(b) // "bar"
```

Well, I learned that Ruby has destructuring as well. So, my code can become:

``` ruby
<% hash.each_with_index.map { |(date, items), index| ... } %>
  <div id="container-<%= index %>">
    <p>Date: <%= date %></p>
    <%= render partial: "items" collection: items %>
  </div>
<% end %>
```

---
title: Creating a better getItemLayout for SectionList in React Native
date: 2024-03-19
tags:
    - react-native
    - npm
---
TLDR: Today, I published a new `npm` package called [`react-native-get-item-layout-section-list`][1]. This package is a helper for the `getItemLayout` prop in a `SectionList` in React Native.

---

## Motivation

The `getItemLayout` prop in a `SectionList` is an optimization prop that improves performance of the list by helping it to quickly calculate the size and position of its items.

When you provide the `getItemLayout` prop, React Native can:

* Jump directly to any list item without sequentially rendering all previous items.
* Maintain scroll position accurately during layout changes or content updates.
* Reduce the need for dynamic measurement as users scroll, leading to smoother experiences.
* Access other props, such as `initialScrollIndex` and `scrollToLocation`

### `FlatList`
In a `FlatList`, it's actually pretty trivial (especially with fixed item heights); you need to return an object with the `length`, `offset`, and `index` properties:

```ts
getItemLayout={(data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
})}
```

However, in a `SectionList`, it's a bit more complicated. The `offset` is calculated on a number of different things:

* list header
* section headers
* items
* item separators
* section footers
* section separators

Additionally, the only _real_ documentation for `getItemLayout` is on [the `FlatList` page][2], and that doesn't help much when you're trying to figure out how to calculate the `offset` for a `SectionList`.

This is where the [`react-native-get-item-layout-section-list`][1] package comes in. It provides a helper function that allows you to pass all of the possible options that effect `offset` and performs the calculations for you.

[1]: <https://github.com/damonbauer/react-native-get-item-layout-section-list>
[2]: <https://reactnative.dev/docs/flatlist#getitemlayout>

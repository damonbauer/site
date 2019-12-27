---
pageTitle: Find or Create By (Rails)
date: 2019-12-27
---

Recently on a Rails project, I had the need to create a `shelf` record and associate it with a `book` record. (These particular records are using a `has_many :through` relationship).

The problem I ran into was the need to search for a `book` to associate with; if it didn't exist, I needed to create it first... I found that Rails has me covered.

[`find_or_create_by`](https://apidock.com/rails/v6.0.0/ActiveRecord/Relation/find_or_create_by) will either find a record with the provided attributes, or create it. (shocker)

Here's how I used it:

``` rb/2,3,12,19
def add
  shelf = find_or_create_shelf
  book = find_or_create_book
  SavedBook.create(book_id: book.id, shelf_id: shelf.id)

  redirect_to user_to_read_path(params[:user_id]), notice: '✓ Book saved for later.'
end

private

def find_or_create_book
    Book.find_or_create_by(id: params[:book_id],
                           image: params.dig(:book, :image),
                           title: params.dig(:book, :title),
                           author: params.dig(:book, :author))
  end

  def find_or_create_shelf
    Shelf.find_or_create_by(user_id: params[:user_id])
  end
```

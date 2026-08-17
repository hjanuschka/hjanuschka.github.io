---
title: "Four Dangling Pointers, One Ownership Lesson"
category: "Chromium"
tech: "C++ / Memory Safety"
---

*Sometimes fixing a dangling raw_ptr is not about changing ownership. It is about making destruction order tell the truth.*

**Status:** 🎉 Landed

## What the Detector Found

Chromium's dangling-pointer detector turns quiet lifetime mistakes into actionable failures. Several unrelated tests and controllers reported the same shape:

- an owning container or singleton is destroyed;
- an unowned `raw_ptr` still contains the old address;
- the pointer is not dereferenced again, but it survives long enough for the detector to report a dangling reference.

These are not always use-after-free crashes. They are ownership models whose teardown order is inconsistent with the relationship expressed in the members.

## C++ Destruction Order Matters

Class members are destroyed in the reverse order of their declaration. Consider:

```cpp
raw_ptr<Model> active_model_ = nullptr;
std::map<Id, std::unique_ptr<Model>> models_;
```

At teardown, `models_` is destroyed first because it was declared last. It frees the `Model`, while `active_model_` still contains its address. Only afterward is the `raw_ptr` destroyed.

If the pointer is an observer into the container, declare it **after** the owner:

```cpp
std::map<Id, std::unique_ptr<Model>> models_;
raw_ptr<Model> active_model_ = nullptr;
```

Now the observer is destroyed first, then the owner. No ownership semantics changed. The declaration order simply matches them.

## Payment Request Profiles

`PaymentRequestState` caches `AutofillProfile` objects and keeps selected/invalid profile pointers into that cache. The observer pointers were declared before `profile_cache_`, so the cache freed the profiles first during teardown.

Moving the pointers after the cache makes them die first and removes the `DanglingUntriaged` annotations rather than suppressing the report.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix dangling selected/invalid profile pointers in PaymentRequestState**](https://chromium-review.googlesource.com/c/chromium/src/+/7930129)

`PaymentRequestSpec` had the same relationship for `selected_shipping_option_`: an observer into owned option data that survived longer than its owner.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix dangling selected_shipping_option_ in PaymentRequestSpec**](https://chromium-review.googlesource.com/c/chromium/src/+/7941513)

## Caption Models

`CaptionBubbleControllerViews` owns caption models in a map and caches the currently active model. Again, `active_model_` was declared before the owning map. Reordering the members makes the lifetime relationship explicit.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix dangling active_model_ in CaptionBubbleControllerViews**](https://chromium-review.googlesource.com/c/chromium/src/+/7935748)

## Tests and Global Singletons

Not every owner is a class member. `MediaStorageUtilTest` cached a pointer to the global `TestStorageMonitor`. `TearDown()` deleted the singleton while the fixture member still pointed at it.

Here member reordering cannot help. The fix clears the cached pointer before deleting the singleton, making the teardown sequence explicit.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix dangling monitor_ in MediaStorageUtilTest**](https://chromium-review.googlesource.com/c/chromium/src/+/7928951)

## The Review Question

When a `raw_ptr` points into another member, ask two questions:

1. Which member owns the pointee?
2. Will the observer be destroyed or cleared before that owner releases it?

If the answer to the second question is no, an annotation is not the fix. The class declaration or teardown order is lying about the lifetime relationship.

## The Takeaway

These fixes are intentionally small. The value comes from letting the detector expose lifetime assumptions that C++ otherwise keeps implicit. A clean result is not merely "the test no longer complains"; it is a class whose declaration order documents who must outlive whom.

## Links

- [PaymentRequestState profiles](https://chromium-review.googlesource.com/c/chromium/src/+/7930129)
- [PaymentRequestSpec shipping option](https://chromium-review.googlesource.com/c/chromium/src/+/7941513)
- [Caption active model](https://chromium-review.googlesource.com/c/chromium/src/+/7935748)
- [MediaStorageUtilTest monitor](https://chromium-review.googlesource.com/c/chromium/src/+/7928951)

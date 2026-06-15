export default function CategoryTag({ category }: { category: string }) {
  return (
    <span className={'tag ' + category.toLowerCase()}>{category}</span>
  )
}

import Link from 'next/link';

export function Header() {
    return (
        <div className="w-full h-[70px] flex bg-blue-500 content-center items-center">
            <div className="w-1/4 text-center">
                Scanner
            </div>
            <ul className="flex gap-7 w-3/4">
                <li>
                    <Link href={''}>link1</Link>
                </li>
                 <li>
                    <Link href={''}>link2</Link>
                 </li>
            </ul>
        </div>
    )
}
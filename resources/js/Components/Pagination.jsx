import { Link } from '@inertiajs/react';
import { get } from 'lodash';

export default function Pagination({paginate, custom, query = '',className = '', getLists}) {
    return(
        <div className={'w-full px-3 flex justify-center items-start md:items-center '+ className}>
            <div className="w-1/3">
                <p className="text-sm text-gray-900 dark:text-gray-200">
                    {`From ${paginate.from} to ${paginate.to} of ${paginate.total}`}
                </p>
            </div>


            {custom ?

            <div className="w-2/3 flex items-center flex-wrap gap-2 justify-end">
                {paginate.links.map((link, i) => {
                    const label = i === 0 ? '<' : i === (paginate.links.length - 1) ? '>' : link.label;
                    const targetPage = i === 0 ? paginate.current_page - 1 : i === (paginate.links.length - 1) ? paginate.current_page + 1 : link.label;
                    const validTargetPage = Math.min(Math.max(1, targetPage), paginate.last_page);

                    if (link.url == null || link.active) {
                        return (
                            <button
                                type="button"
                                className={`text-gray-900 hover:text-gray-200 bg-gray-300 dark:bg-gray-200 hover:bg-[#008F70] dark:hover:bg-[#008F70] focus:ring-0 focus:outline-none dark:focus:ring-0 font-medium rounded-full text-sm w-8 h-8 flex items-center justify-center text-center ${link.url == null || link.active ? '!bg-gray-600 !text-gray-200 hover:bg-gray-600 dark:hover:bg-gray-600' : ''}`}
                                key={`paginate-page-${i}`}
                                disabled={link.url == null || link.active}
                            >
                                {label}
                            </button>
                        );
                    } else {
                        return (
                            <button
                                type="button"
                                onClick={() => getLists(validTargetPage)}
                                className="text-gray-900 hover:text-gray-200 bg-gray-300 dark:bg-gray-200 hover:bg-[#008F70] dark:hover:bg-[#008F70] focus:ring-0 focus:outline-none dark:focus:ring-0 font-medium rounded-full text-sm w-8 h-8 flex items-center justify-center text-center"
                                key={`paginate-page-${i}`}
                                disabled={link.url == null || link.active}
                            >
                                {label}
                            </button>
                        );
                    }
                })}
            </div> :
            <div className="w-2/3 flex flex-wrap gap-2 items-center justify-end">
                {paginate.links.map((link, i) => {
                    if(link.url == null || link.active) {
                        return <button type='button' className={'text-gray-900 hover:text-gray-200 bg-gray-300 dark:bg-gray-200 hover:bg-[#008F70] dark:hover:bg-[#008F70] focus:ring-0 focus:outline-none dark:focus:ring-0 font-medium rounded-full text-sm w-8 h-8 flex items-center justify-center  text-center '+(link.url == null || link.active ? '!bg-gray-600 !text-gray-200 hover:bg-gray-600 dark:hover:bg-gray-600' : '')} key={`paginate-page-${i}`} disabled={link.url == null || link.active}>
                        {i == 0 ? '<' : ((i == (paginate.last_page + 1)) ? '>' : link.label)}
                    </button>
                    } else {
                        return <Link href={link.url + query} className={'text-gray-900 hover:text-gray-200 bg-gray-300 dark:bg-gray-200 hover:bg-[#008F70] dark:hover:bg-[#008F70] focus:ring-0 focus:outline-none dark:focus:ring-0 font-medium rounded-full text-sm w-8 h-8 flex items-center justify-center  text-center '+(link.url == null || link.active ? '!bg-gray-600 !text-gray-200 hover:bg-gray-600 dark:hover:bg-gray-600' : '')} key={`paginate-page-${i}`} disabled={link.url == null || link.active}>
                        {i == 0 ? '<' : ((i == (paginate.last_page + 1)) ? '>' : link.label)}
                    </Link>
                    }
                })}
            </div>

        }
        </div>
    )
}
